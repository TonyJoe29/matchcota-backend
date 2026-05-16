const { query, transaction } = require('../config/db');
const httpError = require('../utils/httpError');

const supportRoles = ['admin', 'soporte'];

const conversationSelect = `
  SELECT
    c.id, c.type, c.adoption_request_id, c.created_by, c.title,
    c.created_at, c.updated_at,
    ar.status AS request_status,
    p.name AS pet_name, p.photo_url AS pet_photo_url,
    requester.id AS requester_id, requester.username AS requester_username,
    requester.name AS requester_name, requester.profile_photo_url AS requester_photo_url,
    owner.id AS owner_id, owner.username AS owner_username,
    owner.name AS owner_name, owner.profile_photo_url AS owner_photo_url,
    creator.username AS creator_username, creator.name AS creator_name,
    creator.profile_photo_url AS creator_photo_url,
    last.message AS last_message, last.created_at AS last_message_at,
    last_sender.username AS last_sender_username
  FROM chat_conversations c
  LEFT JOIN adoption_requests ar ON ar.id = c.adoption_request_id
  LEFT JOIN pets p ON p.id = ar.pet_id
  LEFT JOIN users requester ON requester.id = ar.user_id
  LEFT JOIN users owner ON owner.id = p.owner_id
  INNER JOIN users creator ON creator.id = c.created_by
  LEFT JOIN chat_messages last ON last.id = (
    SELECT cm.id
    FROM chat_messages cm
    WHERE cm.conversation_id = c.id
    ORDER BY cm.created_at DESC, cm.id DESC
    LIMIT 1
  )
  LEFT JOIN users last_sender ON last_sender.id = last.sender_id
`;

const enrichConversation = (conversation, currentUser) => {
  const isSupport = conversation.type === 'support';
  const isRequester = Number(conversation.requester_id) === Number(currentUser.id);
  const otherName = isRequester
    ? conversation.owner_name || conversation.owner_username
    : conversation.requester_name || conversation.requester_username;
  const otherUsername = isRequester ? conversation.owner_username : conversation.requester_username;
  const otherPhoto = isRequester ? conversation.owner_photo_url : conversation.requester_photo_url;

  return {
    ...conversation,
    display_title: isSupport
      ? (supportRoles.includes(currentUser.role)
        ? `Soporte: ${conversation.creator_name || conversation.creator_username}`
        : 'Soporte Matchcota')
      : `${otherName || 'Usuario'} y ${conversation.pet_name || 'mascota'}`,
    display_subtitle: isSupport
      ? 'Dudas, reportes e incidencias'
      : `Solicitud ${conversation.request_status || 'pendiente'}${otherUsername ? ` con @${otherUsername}` : ''}`,
    display_photo_url: isSupport ? conversation.creator_photo_url : otherPhoto,
    pet_photo_url: conversation.pet_photo_url || null
  };
};

const findConversationById = async (id, currentUser) => {
  const rows = await query(`${conversationSelect} WHERE c.id = ? LIMIT 1`, [id]);
  const conversation = rows[0] || null;
  return conversation ? enrichConversation(conversation, currentUser) : null;
};

const isParticipant = async (conversationId, userId) => {
  const rows = await query(
    'SELECT 1 FROM chat_participants WHERE conversation_id = ? AND user_id = ? LIMIT 1',
    [conversationId, userId]
  );
  return Boolean(rows[0]);
};

const canAccessConversation = async (conversation, currentUser) => {
  if (!conversation) {
    return false;
  }

  if (await isParticipant(conversation.id, currentUser.id)) {
    return true;
  }

  return conversation.type === 'support' && supportRoles.includes(currentUser.role);
};

const requireConversationAccess = async (conversationId, currentUser) => {
  const conversation = await findConversationById(conversationId, currentUser);

  if (!conversation) {
    throw httpError(404, 'Conversación no encontrada.');
  }

  if (!(await canAccessConversation(conversation, currentUser))) {
    throw httpError(403, 'No puedes consultar esta conversación.');
  }

  return conversation;
};

const listConversations = async (currentUser) => {
  const supportAccess = supportRoles.includes(currentUser.role) ? 1 : 0;
  const rows = await query(
    `${conversationSelect}
     WHERE EXISTS (
       SELECT 1 FROM chat_participants cp
       WHERE cp.conversation_id = c.id AND cp.user_id = ?
     )
     OR (? = 1 AND c.type = 'support')
     ORDER BY COALESCE(last.created_at, c.updated_at, c.created_at) DESC, c.id DESC`,
    [currentUser.id, supportAccess]
  );

  return rows.map((conversation) => enrichConversation(conversation, currentUser));
};

const addParticipant = async (connection, conversationId, userId) => {
  await connection.execute(
    'INSERT OR IGNORE INTO chat_participants (conversation_id, user_id) VALUES (?, ?)',
    [conversationId, userId]
  );
};

const getOrCreateSupportConversation = async (currentUser) => {
  const existing = await query(
    "SELECT id FROM chat_conversations WHERE type = 'support' AND created_by = ? LIMIT 1",
    [currentUser.id]
  );

  if (existing[0]) {
    return findConversationById(existing[0].id, currentUser);
  }

  let conversationId;
  await transaction(async (connection) => {
    const [result] = await connection.execute(
      "INSERT INTO chat_conversations (type, created_by, title) VALUES ('support', ?, 'Soporte Matchcota')",
      [currentUser.id]
    );
    conversationId = result.insertId;
    await addParticipant(connection, conversationId, currentUser.id);
  });

  return findConversationById(conversationId, currentUser);
};

const getAdoptionRequest = async (requestId) => {
  const rows = await query(
    `SELECT
       ar.id, ar.user_id AS requester_id, ar.status,
       p.owner_id, p.name AS pet_name
     FROM adoption_requests ar
     INNER JOIN pets p ON p.id = ar.pet_id
     WHERE ar.id = ?
     LIMIT 1`,
    [requestId]
  );
  return rows[0] || null;
};

const getOrCreateAdoptionConversation = async (requestId, currentUser) => {
  const request = await getAdoptionRequest(requestId);

  if (!request) {
    throw httpError(404, 'Solicitud de adopción no encontrada.');
  }

  const isAllowed = [request.requester_id, request.owner_id].some(
    (id) => Number(id) === Number(currentUser.id)
  ) || supportRoles.includes(currentUser.role);

  if (!isAllowed) {
    throw httpError(403, 'No puedes abrir chat para esta solicitud.');
  }

  const existing = await query(
    "SELECT id FROM chat_conversations WHERE type = 'adoption' AND adoption_request_id = ? LIMIT 1",
    [requestId]
  );

  if (existing[0]) {
    return findConversationById(existing[0].id, currentUser);
  }

  let conversationId;
  await transaction(async (connection) => {
    const [result] = await connection.execute(
      "INSERT INTO chat_conversations (type, adoption_request_id, created_by, title) VALUES ('adoption', ?, ?, ?)",
      [requestId, currentUser.id, `Adopción de ${request.pet_name}`]
    );
    conversationId = result.insertId;
    await addParticipant(connection, conversationId, request.requester_id);
    await addParticipant(connection, conversationId, request.owner_id);
  });

  return findConversationById(conversationId, currentUser);
};

const listMessages = async (conversationId, currentUser) => {
  await requireConversationAccess(conversationId, currentUser);

  return query(
    `SELECT
       cm.id, cm.conversation_id, cm.sender_id, cm.message, cm.created_at,
       u.username AS sender_username, u.name AS sender_name,
       u.profile_photo_url AS sender_photo_url, r.name AS sender_role
     FROM chat_messages cm
     INNER JOIN users u ON u.id = cm.sender_id
     INNER JOIN roles r ON r.id = u.role_id
     WHERE cm.conversation_id = ?
     ORDER BY cm.created_at ASC, cm.id ASC`,
    [conversationId]
  );
};

const sendMessage = async (conversationId, currentUser, message) => {
  const conversation = await requireConversationAccess(conversationId, currentUser);
  const text = String(message || '').trim();

  if (!text) {
    throw httpError(400, 'El mensaje no puede estar vacío.');
  }

  if (text.length > 800) {
    throw httpError(400, 'El mensaje no puede superar 800 caracteres.');
  }

  const result = await query(
    'INSERT INTO chat_messages (conversation_id, sender_id, message) VALUES (?, ?, ?)',
    [conversation.id, currentUser.id, text]
  );

  await query('UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversation.id]);

  const messages = await listMessages(conversation.id, currentUser);
  return messages.find((item) => Number(item.id) === Number(result.insertId));
};

module.exports = {
  listConversations,
  getOrCreateSupportConversation,
  getOrCreateAdoptionConversation,
  listMessages,
  sendMessage
};

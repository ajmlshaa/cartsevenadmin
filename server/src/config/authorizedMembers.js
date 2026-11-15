import dotenv from 'dotenv';
dotenv.config();

export const getAuthorizedMembers = () => {
  return [
    {
      _id: 'user_partner_1',
      name: process.env.PARTNER_1_NAME || 'AJMALSHA',
      email: (process.env.PARTNER_1_EMAIL || 'ajmalsha@cartseven.com').trim().toLowerCase(),
      password: process.env.PARTNER_1_PASSWORD || 'password123',
      role: process.env.PARTNER_1_ROLE || 'admin',
      location: process.env.PARTNER_1_LOCATION || 'Central Office',
      phone: process.env.PARTNER_1_PHONE || '+91 98201 44891',
      isActive: true,
      aliases: ['ajmalsha@cartseven.com', 'admin@cartseven.com', 'partner1@cartseven.com'],
    },
    {
      _id: 'user_partner_2',
      name: process.env.PARTNER_2_NAME || 'ASHIQUE SALIM',
      email: (process.env.PARTNER_2_EMAIL || 'ashique@cartseven.com').trim().toLowerCase(),
      password: process.env.PARTNER_2_PASSWORD || 'password123',
      role: process.env.PARTNER_2_ROLE || 'accountant',
      location: process.env.PARTNER_2_LOCATION || 'Central Office',
      phone: process.env.PARTNER_2_PHONE || '+91 98201 44892',
      isActive: true,
      aliases: ['ashique@cartseven.com', 'ashiquesalim@cartseven.com', 'accountant@cartseven.com', 'partner2@cartseven.com'],
    },
    {
      _id: 'user_partner_3',
      name: process.env.PARTNER_3_NAME || 'SHANU',
      email: (process.env.PARTNER_3_EMAIL || 'shanu@cartseven.com').trim().toLowerCase(),
      password: process.env.PARTNER_3_PASSWORD || 'password123',
      role: process.env.PARTNER_3_ROLE || 'manager',
      location: process.env.PARTNER_3_LOCATION || 'Central Office',
      phone: process.env.PARTNER_3_PHONE || '+91 98201 44893',
      isActive: true,
      aliases: ['shanu@cartseven.com', 'manager@cartseven.com', 'partner3@cartseven.com'],
    },
  ];
};

export const getPublicAuthorizedMembers = () => {
  return getAuthorizedMembers().map(({ password, aliases, ...partner }) => partner);
};

export const findAuthorizedMemberByEmail = (email) => {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const members = getAuthorizedMembers();
  return members.find(
    (m) => m.email === clean || (m.aliases && m.aliases.includes(clean))
  ) || null;
};

export const isAuthorizedMember = (email) => {
  return Boolean(findAuthorizedMemberByEmail(email));
};

export const verifyMemberCredentials = (email, password) => {
  const member = findAuthorizedMemberByEmail(email);
  if (!member || !password) return false;
  return member.password === password;
};

export const getAuthorizedMemberById = (id) => {
  if (!id) return null;
  const members = getAuthorizedMembers();
  return members.find((m) => m._id === id || String(m._id) === String(id)) || null;
};

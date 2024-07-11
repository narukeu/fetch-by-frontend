export const TOKEN_STORAGE_NAME = `${import.meta.env.TOKEN_STORAGE_PREFIX}_token`;

export const getToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_NAME);
};

export const setToken = (tokenValue: string) => {
  localStorage.setItem(TOKEN_STORAGE_NAME, tokenValue);
};

export const deleteToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_NAME);
};

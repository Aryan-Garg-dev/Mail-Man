import bcrypt from 'bcrypt';

export const encrypt = async (plainText: string): Promise<string> => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainText, salt);
};

export const decrypt = async (entered: string, stored: string): Promise<boolean> => {
  return await bcrypt.compare(entered, stored);
};

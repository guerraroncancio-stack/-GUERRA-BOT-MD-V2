import { useMultiFileAuthState } from '@whiskeysockets/baileys'

export default async function useSQLiteAuthState(sessionPath) {

  const {
    state,
    saveCreds
  } = await useMultiFileAuthState(sessionPath)

  return {
    state,
    saveCreds
  }
}

/**
 * Récupère les messages entre deux utilisateurs
 * @param {string} from - UUID de l'utilisateur actuel
 * @param {string} to - UUID de l'autre utilisateur
 * @param {number} offset - Position de départ
 * @param {number} limit - Nombre de messages à récupérer
 * @returns {Promise<Array>} Liste des messages
 */
export async function fetchMessages(from, to, offset = 0, limit = 10) {
  try {
    const res = await fetch(`/api/chat?from=${from}&to=${to}&offset=${offset}&limit=${limit}`);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
    const result = await res.json();
    return result?.data || [];
  } catch (err) {
    console.error('Erreur lors du fetch des messages :', err);
    return [];
  }
}

export async function getAllUsers() {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (result.code !== 200) return;
    return result.data.users;
  } catch (error) {
    console.error('API Error: ', error);
    // TODO: handle error
    // display a error msg
  }
}

import { confClient } from './client'
import { NavContentType } from './constants';

export async function loadNav() {
  try {
    const { items } = await confClient.getEntries({
      limit: 1,
      content_type: NavContentType
    });
    const { fields } = items[0];

    return fields; 
  } catch (error) {
    console.log(error)
  }

  return null;
}
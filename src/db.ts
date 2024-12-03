import {Client} from "pg";

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'botdb',
    password: 'yourpassword',
    port: 5432,
});

client.connect()
    .then(() => console.log('Connected to the PostgreSQL database'))
    .catch(err => console.error('Connection error', err.stack));

export const insertPhrase = async (
    user_id: number, username: string = 'ghost', english_phrase: string, translate: string, examples: string = ''
): Promise<number> => {
    const query = `INSERT INTO bot_phrases (user_id, username, english_phrase, translate, examples)
                   VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
    console.error('Query inserted: ', query);
    try {
        const res = await client.query(query, [user_id, username, english_phrase, translate, examples]);
        console.log('Inserted phrase with ID:', res.rows[0].id);
        return res.rows[0].id
    } catch (err) {
        throw new Error();
    }
};

export const getAllPhrasesByUserName = async (userId: number): Promise<any[] | undefined> => {
    const query = `SELECT *
                   FROM bot_phrases
    WHERE username = ${userId}`;
    try {
        const res = await client.query(query);
        return res.rows;
    } catch (err) {
        console.error('Error fetching data', err);
    }
};

export const getNotLearnedPhrasesByUserName = async (userId: number): Promise<any[] | undefined> => {
    const user_id = userId.toString();
    const query = `SELECT * FROM bot_phrases WHERE learned = false AND user_id = $1`;
    try {
        const res = await client.query(query, [user_id]);
        return res.rows;
    } catch (err) {
        console.error('Error fetching data', err);
    }
};

export const getRandomPhraseByUserId = async (userId: number) => {
    const user_id = userId.toString();
    const query = `
        SELECT *  FROM bot_phrases WHERE user_id = $1 ORDER BY RANDOM() LIMIT 1;
    `;
    try {
        const res = await client.query(query, [user_id]);
        return res.rows[0];
    } catch (err) {
        console.error("Error fetching random phrase:", err);
        return null;
    }
};

export const markedPhraseAsLearned = async (cardId: number): Promise<void> => {
    const query = `UPDATE bot_phrases
                   SET learned = true
                   WHERE id = ${cardId};`
    try {
        const res = await client.query(query);
    } catch (err) {
        console.error('Error fetching data', err);
    }
}
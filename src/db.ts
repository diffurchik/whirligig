import {Client} from "pg";
import {UserSchedule} from "./types";

// const client = new Client({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'botdb',
//     password: 'yourpassword',
//     port: 5432,
// });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

client.connect()
    .then(() => console.log('Connected to the PostgreSQL database'))
    .catch(err => console.error('Connection error', err.stack));

export const insertPhrase = async (
    user_id: number, username: string = 'ghost', english_phrase: string, translate: string, examples: string = ''
): Promise<number> => {
    const query = `INSERT INTO user_cards (user_id, username, english_phrase, translate, examples)
                   VALUES ($1, $2, $3, $4, $5)
                   RETURNING id;`;
    console.log('Query inserted: ', query);
    try {
        const res = await client.query(query, [user_id, username, english_phrase, translate, examples]);
        console.log('Inserted phrase with ID:', res.rows[0].id);
        return res.rows[0].id
    } catch (err) {
        throw new Error();
    }
};

export const getAllCardsByUserId = async (user_id: number): Promise<any[] | undefined> => {
    const query = `SELECT *
                   FROM user_cards
                   WHERE user_id = $1`;
    try {
        const res = await client.query(query, [user_id]);
        return res.rows;
    } catch (err) {
        console.error('Error fetching data', err);
    }
};

export const getNotLearnedPhrasesByUserName = async (user_id: number): Promise<any[] | undefined> => {
    const query = `SELECT *
                   FROM user_cards
                   WHERE learned = false
                     AND user_id = $1`;
    try {
        const res = await client.query(query, [user_id]);
        return res.rows;
    } catch (err) {
        console.error('Error fetching data', err);
    }
};

export const getRandomCardByUserId = async (user_id: number) => {
    const query = `SELECT *
                   FROM user_cards
                   WHERE user_id = $1
                   ORDER BY RANDOM()
                   LIMIT 1;`
    try {
        const res = await client.query(query, [user_id]);
        return res.rows[0];
    } catch (err) {
        console.error("Error fetching random phrase:", err);
        return null;
    }
};

export const markedCardAsLearned = async (cardId: number): Promise<void> => {
    const query = `UPDATE user_cards
                   SET learned = true
                   WHERE id = ${cardId};`
    try {
        const res = await client.query(query);
    } catch (err) {
        console.error('Error fetching data', err);
    }
}

export const insertRandomCardTime = async (user_id: number, rand_card_time: string, show_random_card: boolean,) => {
    const query = `INSERT INTO user_settings (rand_card_time, show_random_card, user_id)
                   VALUES ($1, $2, $3)
                   RETURNING id;`;
    console.log('Query inserted: ', query);
    try {
        const res = await client.query(query, [rand_card_time, show_random_card, user_id]);
        console.log('Inserted a schedule with ID:', res.rows[0].id);
        return res.rows[0].id
    } catch (err) {
        throw new Error();
    }
}

export const updateRandomCardTime = async (user_id: number, rand_card_time: string, show_random_card: boolean,) => {
    const query = `UPDATE user_settings
                   SET rand_card_time=$1
                   WHERE  user_id=$2`;
    console.log('Query inserted: ', query);
    try {
        const res = await client.query(query, [rand_card_time, user_id]);
        console.log('Updated a schedule with user ID:', user_id);
    } catch (err) {
        throw new Error();
    }
}

export const getAllUserSchedules = async (): Promise<UserSchedule[] | undefined> => {
    const query = `SELECT *
                   FROM user_settings
                   WHERE show_random_card is true`;
    try {
        const res = await client.query(query);
        return res.rows;
    } catch (err) {
        console.error('Error fetching data', err);
    }
}

export const getScheduleByUser = async (user_id: number): Promise<UserSchedule[] | undefined> => {
    const query = `SELECT *
                   FROM user_settings
                   WHERE show_random_card is true AND user_id = $1`;
    try {
        const res = await client.query(query, [user_id]);
        return res.rows;
    } catch (err) {
        console.error('Error fetching data', err);
    }
}

export const deleteCardFromDB = async (user_id: number, card_id: number): Promise<any> => {
    const query = `DELETE
                   FROM user_cards
                   WHERE id = ${card_id}
                     AND user_id = $1`;
    try {
        const res = await client.query(query, [user_id]);
        console.log('Inserted phrase with ID:', res);
        return true;
    } catch (err) {
        console.error('Error deleting user: ', err);
    }
}
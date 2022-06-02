var express = require("express");
var router = express.Router();

// GET /api/games
/**
 * @swagger
 * /api/games:
 *   get:
 *     description: Get all games
 *     tags: [Game]
 *     responses:
 *       200:
 *          description: Returns list of games
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Game'
 */

/**
 * @swagger
 * /api/games?title={urlSlug}:
 *   get:
 *     description: Search game
 *     tags: [Game]
 *     parameters:
 *       - name: title
 *         in: query
 *         description: Search
 *         required: true
 *     responses:
 *       200:
 *          description: Returns game
 *          content:
 *            application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Game'
 */

  router.get("/", async (req, res) => {

    const { title } = req.query;

    const db = req.app.locals.db;
  
    const games = title 
      ? await searchGame(title, db)
      : await getGames(db);
      
  
    res.json(games);

    
  });



  // GET /api/games/{urlSlug}
/**
 * @swagger
 * /api/games/{title}:
 *   get:
 *     description: Get game with title
 *     tags: [Game]
 *     parameters:
 *       - name: title
 *         in: path
 *         description: Game title
 *         required: true
 *     responses:
 *       200:
 *          description: Returns game with same title
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
 */

router.get("/:urlSlug", async (req, res) => {

    const { urlSlug } = req.params;
  
    const db = req.app.locals.db;
  
    const game = await getGame(urlSlug, db);
  
    if (!game) {
      // sätt statuskoden till "404 Not Found"
      res.status(404).end();
      return;
    }
  
    // sätter automatiskt statuskoden till "200 OK"
    res.json(game); 
  });



  //POST /api/games
/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Create new game 
 *     description: Create new game
 *     tags: [Game]
 *     consumes:
 *       - application/json
 *     requestBody:
 *       description: Game details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/NewGame'
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Returns game        
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Game'                                
 *       400:
 *         description: Invalid game
 */

router.post('/',  async (req, res) => {

    const {
        title,
        release,
        genre,
        description,
        imageUrl
      } = req.body;
  
    const game = {
        title,
        release,
        genre,
        description,
        imageUrl,
        urlSlug: generateURLSlug(title)
    };
  

  
    const db = req.app.locals.db;
  
    game.id = await saveGame(game, db);

  
    // Sätt Location-headern till "/api/games/tetris" (t.ex.)
    res.location(`/api/games/${game.urlSlug}`);
  
      
      res.status(201).send(game);


  
    
});



//DELETE /api/games/{urlSlug}
/**
 * @swagger
 * /api/games/{urlSlug}:
 *   delete:
 *     description: Delete game
 *     tags: [Game]
 *     parameters:
 *       - name: urlSlug
 *         in: path
 *         description: Game urlSlug
 *         required: true
 *     responses:
 *       204:
 *         description: Product deleted
 */

router.delete('/:urlSlug', async (req, res) => {

  const { urlSlug } = req.params;

  const db = req.app.locals.db;
  
  await deleteGame(urlSlug, db);

  // 204 No Content
  res.status(204).send();
});



//GET /api/games/{urlSlug}/highscores
/**
 * @swagger
 * /api/games/{urlSlug}/highscores:
 *   get:
 *     description: Get highscores for game
 *     tags: [Highscores]
 *     parameters:
 *       - name: urlSlug
 *         in: path
 *         description: Game urlSlug
 *         required: true
 *     responses:
 *       200:
 *          description: Returns list of highscores
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Highscores'
 */

router.get("/:urlSlug/highscores", async (req, res) => {

  const { urlSlug } = req.params;

  const db = req.app.locals.db;

  const gScore = await getScoresGame(urlSlug, db);


  // sätter automatiskt statuskoden till "200 OK"
  res.json(gScore); 
});



async function deleteGame(urlSlug, db) {

  const sql = `
    DELETE FROM game
          WHERE url_slug = $1
  `;

  await db.query(sql, [urlSlug]);
}


async function saveGame(game, db) {

    const sql = `
        INSERT INTO game (
            title,
            release,
            genre,
            description,
            url_slug,
            image_url
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `;
  
    const result = await db.query(sql, [
        game.title,
        game.release,
        game.genre,
        game.description,
        game.urlSlug,
        game.imageUrl
    ]);
  
    return result.rows[0].id;
  }


  async function getGame(urlSlug, db) {

    const sql = `
            SELECT id,
                    title,
                    release,
                    genre,
                    description,
                    url_slug,
                    image_url
            FROM game
            WHERE url_slug = $1
    `;
  
    const result = await db.query(sql, [urlSlug]);
  
    const game = result.rows.length > 0
                      ? result.rows[0]
                      : undefined;
  
    return game;
  }


  async function getGames(db) {
    const sql = `
                SELECT id,
                    title,
                    release,
                    genre,
                    description,
                    url_slug,
                    image_url
                FROM game
      `;
  
    const result = await db.query(sql);

    const games = result.rows.map(game => ({
      id: game.id,
      title: game.title,
      release: game.release,
      genre: game.genre,
      description: game.description,
      imageUrl: game.image_url,
      urlSlug: game.url_slug
    }));
  
    return games;
  }

  async function searchGame(title, db) {

    const sql = `
                SELECT id,
                        title,
                        release,
                        genre,
                        description,
                        url_slug,
                        image_url
                FROM game
            WHERE title ILIKE '%' || $1 || '%'
    `;
  
    const result = await db.query(sql, [title]);
  

  
    return result.rows;
  }


  async function getScoresGame(urlSlug, db) {
    const sql = `
              SELECT 
                title,
                highscore,
                player,
                played_at
              FROM game
              INNER JOIN score
              ON score.game_id = game.id
              WHERE url_slug = $1
      `;
  
    const result = await db.query(sql, [urlSlug]);

    return result.rows
  }


  const generateURLSlug = (name) =>
  name.replace('-', '')
      .replace(' ', '-')
      .toLowerCase();

      
      
/**
* @swagger
* components:
*   schemas:
*     Game:
*       type: object
*       properties:
*        id:
*          type: integer
*          description: Game id
*        title:
*           type: string
*           description: Game title
*        release:
*           type: string
*           description: Release year
*        genre:
*           type: string
*           description: Game genre
*        description:
*           type: string
*           description: Game description
*        imageUrl:
*           type: string
*           description: Game image
*        urlSlug:
*           type: string
*           description: Game URL slug
*     NewGame:
*       type: object
*       properties:
*        title:
*           type: string
*           description: Game title
*        release:
*           type: string
*           description: Release year
*        genre:
*           type: string
*           description: Game genre
*        description:
*           type: string
*           description: Game description
*        imageUrl:
*           type: string
*           description: Game image
*     Highscores:
*       type: object
*       properties:
*        title:
*           type: string
*           description: Game title
*        highscore:
*           type: string
*           description: Highscore
*        player:
*           type: string
*           description: Player
*        playedAt:
*           type: string
*           description: Date when highscore is made
*     NewHighscore:
*       type: object
*       properties:
*        highscore:
*           type: string
*           description: Highscore
*        player:
*           type: string
*           description: Player
*        playedAt:
*           type: string
*           description: Date when highscore is made
*        gameId:
*           type: integer
*           description: Game id
*/


module.exports = router;
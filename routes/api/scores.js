var express = require("express");
var router = express.Router();


//POST /api/scores
/**
 * @swagger
 * /api/scores:
 *   post:
 *     summary: Create new highscore
 *     description: Create new highscore
 *     tags: [Highscores]
 *     consumes:
 *       - application/json
 *     requestBody:
 *       description: Highscore details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/NewHighscore'
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Returns highscore        
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Highscores'                                
 *       400:
 *         description: Invalid highscore
 */

router.post('/',  async (req, res) => {

    const {
      player,
      played_at,
      highscore,
      game_id
  } = req.body;

  const score = {
      player,
      played_at,
      highscore,
      game_id
  };
  

  
    const db = req.app.locals.db;
  
    score.id = await saveHighscore(score, db);

  
    // Sätt Location-headern till "/api/games/tetris" (t.ex.)
    res.location(`/api/scores/${score.urlSlug}`);
  
      
      res.status(201).send(score);


  
    
});


async function saveHighscore(score, db) {

    const sql = `
    INSERT INTO score (
        player,
        highscore,
        played_at,
        game_id
    ) VALUES ($1, $2, $3, $4)
    `;

    await db.query(sql, [
        score.player,
        score.highscore,
        score.played_at,
        score.game_id
    ]);

}


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
*        played_at:
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
*        played_at:
*           type: string
*           description: Date when highscore is made
*        game_id:
*           type: integer
*           description: Game id
*/


module.exports = router;
var express = require("express");
var router = express.Router();


//GET /api/scores/highscores
router.get("/", async (req, res) => {


    const db = req.app.locals.db;
  
    const scores = await getScores(db)
  
    res.json(scores);
  });



  async function getScores(db) {
    const sql = `
            SELECT
                title,
                highscore
            FROM score
            INNER JOIN game
            ON game.id = score.game_id
      `;
  
    const result = await db.query(sql);
  
    return result.rows;
  }



module.exports = router;
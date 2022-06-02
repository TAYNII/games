CREATE TABLE game (
  id INTEGER GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(50) NOT NULL,
  release DATE NOT NULL,
  genre VARCHAR NOT NULL,
  description VARCHAR(500) NOT NULL,
  url_slug VARCHAR(50) NOT NULL,
  image_url VARCHAR(250) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (url_slug)
);

CREATE TABLE score (
  id INTEGER GENERATED ALWAYS AS IDENTITY,
  player VARCHAR(50) NOT NULL,
  played_at DATE NOT NULL,
  highscore BIGSERIAL NOT NULL,
  game_id INTEGER,
  FOREIGN KEY (game_id)
  REFERENCES game (id),
  PRIMARY KEY (id)
);

INSERT INTO game (
title,
release,
genre,
description,
url_slug,
image_url
) VALUES
(
'Tetris',
'1984-06-06',
'Puzzle',
'Tetris är ett dator- och TV-spel som går ut på att ordna olika fallande figurer.',
'tetris',
'https://play-lh.googleusercontent.com/za2Nu_qjMw5GzWfbzet4zeiZT1xvJlTRi4NJzGpJWX9grxFAAko5dGBwe7qeqK01THw'
);
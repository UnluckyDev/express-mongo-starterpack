const express = require('express');
const monk = require('monk');
const joi = require('joi');

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');


const db = monk(process.env.MONGO_URI);

const faqs = db.get("faqs");
const schema = joi.object({
  question: joi.string().trim().required(),
  answer: joi.string().trim().required(),
  video_url: joi.string().uri(),
  cacheTime:joi.string(),
});

//limita ogni IP a fare al massimo 10 chiamate ogni 30 secondi
//aggiungi la seguente linea di codice nel file app.js se l'endpoint è dietro ad un reverse proxy (Nginx, Heroku, bluemix, AWS ELB ...)
//app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 30 * 1000, //ogni 30 secondi
  max: 10, //max 2 chiamate
});

const speedLimiter = slowDown({
  windowMs: 30 * 1000,  //ogni 30 secondi
  delayAfter: 1,  //dalla prima chiamata effettuata
  delayMs: 500  //aumenta il tempo di risposta di 500ms ogni chiamata
});

const router = express.Router();

let cachedData;
let cacheTime;

let secondiInCache = 30 * 1000;

//endpoint con risposta che viene cachata per 30 secondi per evitarne spam
// - per aumentare il tempo di cache modificare la variabile secondiInCache
router.get('/', async (req, res, next) => {

  //se il cacheTime è maggiore di 30 secondi fa allora posso ritornare il dato cachato
  //se invece non supera Date.now() - 30 secondi allora vuol dire che sono passati 30 secondi e posso rifare la chiamata

  //in memory cache, non ottimale ma funziona, in caso di ambiente di prod suggerirei di utilizzare redis o mongoDB
  if(cacheTime && cacheTime > Date.now() - secondiInCache){
    return res.json(cachedData);
  }

  try {
    const items = await faqs.find({});

    //faccio la richiesta e inserisco in cache la risposta e il tempo in cui ho risposto
    cachedData = items;
    cacheTime = Date.now(); 

    items.cacheTime = cacheTime;

    return res.json(items);

  } catch (error) {
    return next(error);
  }
});

//endpoint con limitazione al numero di chiamate possibili dall'ip chiamante ogni X secondi (in questo caso 30 secondi)
// - vedi const limiter per il settaggio del limite
//Aggiunta anche speedLimited per aumentare il tempo di risposta di 500ms ogni chiamata effettuata (per evitare spam di chiamate)
// - vedi const speedLimiter per settaggio
router.get('/:id', limiter, speedLimiter, async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await faqs.findOne({
      _id: id,
    });

    if (!item) return next();
    return res.json(item)

  } catch (error) {
    return next(error);
  }
});

module.exports = router;
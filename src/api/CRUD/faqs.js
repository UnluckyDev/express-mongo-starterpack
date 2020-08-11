const express = require('express');
const monk = require('monk');
const joi = require('joi');

//mi collego al db di Mongo
const db = monk(process.env.MONGO_URI);
//mi collego alla collection del DB
const faqs = db.get("faqs");

// Definisco lo schema delle Faqs utilizzando JOI (libreria per schema validation)
const schema = joi.object({
  question: joi.string().trim().required(),
  answer: joi.string().trim().required(),
  video_url: joi.string().uri(),
});

const router = express.Router();

// READ ALL
router.get('/', async (req, res, next) => {
  try {
    const items = await faqs.find({});
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// READ ONE
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await faqs.findOne({
      _id: id,
    });

    if (!item) return next();
    return res.json(item)

  } catch (error) {
    next(error);
  }
});

// CREATE ONE
router.post('/', async (req, res, next) => {
  try {
    console.log(req.body);
    const value = await schema.validateAsync(req.body);
    const inserted = await faqs.insert(value);
    res.json(inserted);
  } catch (error) {
    next(error);
  }

});

// UPDATE ONE
router.put('/:id', async (req, res, next) => {
  try {
    //prendo l'id dai parametri della chiamata
    const { id } = req.params;

    //valido il JSON usato per modificare l'oggetto
    const value = await schema.validateAsync(req.body);

    //trovo l'oggetto da modificare nel DB tramite l'_id
    const item = await faqs.findOne({
      _id: id,
    });

    //se non lo trovo mando la richiesta al errorHandler
    if (!item) return next();

    //effettuiamo l'update (sull'item avente lo stesso _id) settando (operatore atomico $set) value (payload JSON) come update 
    await faqs.update({
      _id: id,
    }, {
      $set: value,
    });
    res.json(value);
  } catch (error) {
    next(error);
  }

});

// DELETE ONE
router.delete('/:id', async (req, res, next) => {

  try {
    const { id } = req.params;
    await faqs.remove({ _id: id });
    res.json({
      message: 'Success',
    })
  } catch (error) {
    next(error);
  }
});

//Leggo Collection Users dentro archismall
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await faqs.findOne({
      _id: id,
    });

    if (!item) return next();
    return res.json(item)

  } catch (error) {
    next(error);
  }
});



module.exports = router;
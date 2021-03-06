"use strict";

const express = require(`express`);
const multer = require(`multer`);

const asyncMiddleware = require(`./async-middleware`);
const GridStream = require(`./stream`);
const handlers = require(`./handlers`);
const validate = require(`../validate`);
const logger = require(`../../logger`);

const storage = multer.memoryStorage();
const upload = multer({storage});
const jsonParser = express.json();

const PAGE_DEFAULT_LIMIT = 20;
const PAGE_DEFAULT_SKIP = 0;

module.exports = (offersRouter) => {
  offersRouter.get(`/offers`, asyncMiddleware(async (req, res, _next) => {
    const limit = req.query.limit ? handlers.queryCheck(req.query.limit) : PAGE_DEFAULT_LIMIT;
    const skip = req.query.skip ? handlers.queryCheck(req.query.skip) : PAGE_DEFAULT_SKIP;
    const cursor = await offersRouter.offersStore.getAllOffers();
    const cursorWithParams = await cursor.skip(skip).limit(limit);
    const offersCount = await cursor.count();
    const offersArray = await cursorWithParams.toArray();

    res.format({
      json: (() => {
        res.send({
          data: offersArray,
          skip,
          limit,
          total: offersCount
        });
      }),
      html: (() => {
        res.send(handlers.generateAllOffersHtml(offersArray, skip, limit, offersCount));
      }),
      default: (() => {
        res.send({
          data: offersArray,
          skip,
          limit,
          total: offersCount
        });
      }),
    });
    logger.info(`GET all request was sent`);
  }));

  offersRouter.post(`/offers`, jsonParser, upload.fields([{name: `avatar`, maxCount: 1}, {name: `preview`}]), asyncMiddleware(async (req, res, _next) => {
    const body = req.body;
    const {avatar, preview} = handlers.checkFiles(req);

    const validatedRequest = validate(body);
    const dataToResponse = handlers.modifyRequestToResponse(validatedRequest);
    const dataToDatabase = handlers.modifyRequestToDatabase(dataToResponse, avatar, preview);

    await offersRouter.offersStore.saveOffer(dataToDatabase);
    const dateId = dataToDatabase.date;

    if (avatar) {
      await offersRouter.imagesStore.save(dateId, new GridStream(avatar.buffer));
    }
    if (preview) {
      await offersRouter.previewsStore.save(dateId, new GridStream(preview.buffer));
    }
    res.send(dataToResponse);

    logger.info(`POST request was sent`);
  }));
};


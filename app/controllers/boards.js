const express = require('express');
const sequelize = require('sequelize');
const AWS = require('aws-sdk');
const formidable = require('formidable');
const Aigle = require('aigle');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const {
  isLoggedIn
} = require('../middlewares/checkLogin');
const {
  calculateDistance
} = require('../services/boardsServices');

const db = require('../models');
const {
  resultFormat,
} = require('../helpers/formHelper');

const router = express.Router();

router.get('/users/likes', isLoggedIn, async (req, res) => {
  // const read = await db.boards.findAll({});
  const query = `
    select
      * 
    from likes 
      join (
        select
          * 
        from boards
          left join (
            SELECT
              boardId,
              count(*) as likeCounts
                FROM likes
                  join boards
                    on likes.boardId = boards.id 
                group by boardId) as counts
            on boards.id = counts.boardId) as myBoards
      where likes.userId = ${req.user.id};
    `;
  const result = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  res.json(resultFormat(true, null, result));
});


router.get('/users', isLoggedIn, async (req, res) => {
  // const read = await db.boards.findAll({});
  const query = `
    select
      * 
    from boards
      left join (SELECT boardId, count(*) as likeCounts FROM Node2.likes group by boardId) as counts
        on boards.id = counts.boardId
      where userId = ${req.user.id};
    `;
  const result = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  res.json(resultFormat(true, null, result));
});

router.get('/users/:id', isLoggedIn, async (req, res) => {
  // const read = await db.boards.findAll({});
  const {
    id
  } = req.params;
  const query = `
    select
      * 
    from boards
      left join (SELECT boardId, count(*) as likeCounts FROM Node2.likes group by boardId) as counts
        on boards.id = counts.boardId
      where userId = ${id};
    `;
  const result = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  res.json(resultFormat(true, null, result));
});

router.get('/', async (req, res) => {
  // const read = await db.boards.findAll({});
  Aigle.mixin(_);
  const query = `
  select
    GazeBoards.id, 
    GazeBoards.radius,
    GazeBoards.content,
    GazeBoards.updatedAt,
    GazeCategory.name,
    GazeBoards.lat,
    GazeBoards.lon
  from GazeBoards
  left join (select count(*), boardId from GazeLikes group by boardId) as counts
    ON GazeBoards.id = counts.boardId
  left join GazeCategory
    ON GazeBoards.categoryId = GazeCategory.id
  where
    NOT userId = 1
    AND categoryId = 1
  ;
    `;
  const boards = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  const result = [];

  await Aigle.forEach(boards, async board => {
    const d = await calculateDistance(parseInt(board.lat, 10), parseInt(board.lon, 10), 35.1257712, 129.0376117);
    if (d < board.radius) {
      await result.push(board)
    }
  })

  res.json(resultFormat(true, null, result));
});

router.get('/:id', isLoggedIn, async (req, res) => {
  const {
    id,
  } = req.params;
  // const read = await db.boards.findOne({
  //     where:{
  //       id,
  //     }
  //   });
  const query = `
    select
      * 
    from boards
      left join (SELECT boardId, count(*) as likeCounts FROM Node2.likes group by boardId) as counts
        on boards.id = counts.boardId
    where boards.id = ${id};
    `;
  const result = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  console.log('result', result);
  res.json(resultFormat(true, null, result[0]));
});

router.post('/', async (req, res) => {
  AWS.config.update({
    accessKeyId: global.config.AWSAccessKeyId,
    secretAccessKey: global.config.AWSSecretKey,
  });
  const s3 = new AWS.S3();
  const form = new formidable.IncomingForm();

  // make upload dirName
  // const dirName = '';
  let possible = '0123456789abcdef';
  // for (var i = 0; i < 4; i++) dirName += possible.charAt(Math.floor(Math.random() * possible.length));
  // dirName = dirName + '-' + new Date().toISOString().substr(0, 10);

  // make upload fileName
  let fileName = '';
  possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i += 1) fileName += possible.charAt(Math.floor(Math.random() * possible.length));

  // 서버에 업로드 완료 후
  form.parse(req, async (err, fields, files) => {
    if (!files.image) {
      const read = await db.boards.create({
        categoryId: fields.categoryId,
        content: fields.content,
        userId: fields.userId,
        lon: fields.lon,
        lat: fields.lat,
      });
      res.json(resultFormat(true, null, read));
      return;
    }

    const {
      image
    } = files;
    const defaultPath = fileName;
    const imageUrl = defaultPath + path.parse(image.name).ext;

    // image upload
    // console.log('image path : ' + defaultPath + path.parse(image.name).ext);
    s3.upload({
      Bucket: 'yunhee',
      Key: imageUrl,
      ACL: 'public-read',
      Body: fs.createReadStream(image.path),
    }, (error, result) => {
      if (error) console.log(error);
      else console.log(result);
    });
    const baseUrl = 'https://yunhee.s3.amazonaws.com/';
    const imgUrl = baseUrl + imageUrl;
    const read = await db.boards.create({
      categoryId: fields.categoryId,
      content: fields.content,
      userId: fields.userId,
      lon: fields.lon,
      lat: fields.lat,
      imgUrl,
    });
    res.json(resultFormat(true, null, read));
    // unlink tmp files
    fs.unlinkSync(image.path);
  });
});

router.put('/:id', isLoggedIn, async (req, res) => {
  AWS.config.update({
    accessKeyId: global.config.AWSAccessKeyId,
    secretAccessKey: global.config.AWSSecretKey,
  });
  const s3 = new AWS.S3();
  const form = new formidable.IncomingForm();

  // make upload dirName
  // const dirName = '';
  let possible = '0123456789abcdef';
  // for (var i = 0; i < 4; i++) dirName += possible.charAt(Math.floor(Math.random() * possible.length));
  // dirName = dirName + '-' + new Date().toISOString().substr(0, 10);

  // make upload fileName
  let fileName = '';
  possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i += 1) fileName += possible.charAt(Math.floor(Math.random() * possible.length));

  // 서버에 업로드 완료 후
  form.parse(req, isLoggedIn, async (err, fields, files) => {
    if (!files.image) {
      const read = await db.boards.update({
        categoryId: fields.categoryId,
        content: fields.content,
        userId: fields.userId,
        lon: fields.lon,
        lat: fields.lat,
        flag: fields.flag,
        radius: fields.radius,
      }, {
        where: {
          id: req.params.id,
        },
      });
      res.json(resultFormat(true, null, read));
      return;
    }

    const {
      image
    } = files;
    const defaultPath = fileName;
    const imageUrl = defaultPath + path.parse(image.name).ext;

    // image upload
    // console.log('image path : ' + defaultPath + path.parse(image.name).ext);
    s3.upload({
      Bucket: 'yunhee',
      Key: imageUrl,
      ACL: 'public-read',
      Body: fs.createReadStream(image.path),
    }, (error, result) => {
      if (error) console.log(error);
      else console.log(result);
    });
    const baseUrl = 'https://yunhee.s3.amazonaws.com/';
    const imgUrl = baseUrl + imageUrl;
    const read = await db.boards.update({
      categoryId: fields.categoryId,
      content: fields.content,
      userId: fields.userId,
      lon: fields.lon,
      lat: fields.lat,
      flag: fields.flag,
      radius: fields.radius,
      imgUrl,
    }, {
      where: {
        id: req.params.id,
      },
    });
    res.json(resultFormat(true, null, read));
    // unlink tmp files
    fs.unlinkSync(image.path);
  });
});

// 게시글 id에 해당하는 글 지우기 -> deleteBoards에 넣기
router.delete('/:id', isLoggedIn, async (req, res) => {
  const {
    id,
  } = req.params;
  // await db.deleteBoards.create({
  // });
  const board = await db.boards.findOne({
    where: {
      id
    }
  });
  const deleteBoards = await db.deleteBoards.create({
    id: board.id,
    categoryId: board.categoryId,
    content: board.content,
    userId: board.userId,
    lon: board.lon,
    lat: board.lat,
    flag: board.flag,
    radius: board.radius,
    imgUrl: board.imgUrl,
  })
  await db.boards.destroy({
    where: {
      id,
    },
  });

  res.json(resultFormat(true, null, deleteBoards));
});

module.exports = router;

const request = require('supertest');

const app = require('../src/app');
const { any } = require('joi');
const chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);


describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏'
      }, done);
  });
});

describe('GET /api/v1/emojis', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/emojis')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, ['😀', '😳', '🙄'], done);
  });
});

describe('GET /api/v1/faqs', () => {
  it('responds with an array of faqs', (done) => {
    request(app)
      .get('/api/v1/faqs')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      })
  });
});

describe('POST /api/v1/faqs', () => {
  it('respond with a JSON of the faq just created', (done) => {
    request(app)
      .post('/api/v1/faqs')
      .send({ "question": "t'appost?", "answer": "no... unlucky" })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        done();
      })
  });
});

// describe('DELETE /api/v1/faqs/5f32946741c82e4922d7a071', () => {
//   it('respond with a JSON with message "success"', (done) => {
//     request(app)
//       .delete('/api/v1/faqs/5f32946741c82e4922d7a071')
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(200, {
//         message: "Success"
//       }, done);
//   });
// });

const chai = require('chai');
const chaiHttp = require('chai-http');
// const server = require('../index');
const should = chai.should();
const server = "localhost:3000";

chai.use(chaiHttp);

describe('Follow/Unfollow', () => {
    let token;

    before((done) => {
        chai.request(server)
            .post('/api/authenticate')
            .send({email: 'test@email.com', password: 'Password@123'})
            .end((err, res) => {
                token = res.body.token;
                done();
            });
    });

    it('should return a 200 status code when a user follows another user', (done) => {
        chai.request(server)
            .post('/api/follow/63c906010d8aa33103acf9b6')
            .set('Authorization', `${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('should return a 401 status code when a user tries to follow themselves', (done) => {
        chai.request(server)
            .post('/api/follow/63c94912267cba83d57ad3b8')
            .set('Authorization', `${token}`)
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.have.property('error').eql('Cannot follow yourself');
                done();
            });
    });

    it('should return a 200 status code when a user unfollows another user', (done) => {
        chai.request(server)
            .post('/api/unfollow/63c906010d8aa33103acf9b6').set('Authorization', `${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('should return a 401 status code when a user tries to unfollow a user they are not following', (done) => {
        chai.request(server)
            .post('/api/unfollow/63c906010d8aa33103acf9b6')
            .set('Authorization', `${token}`)
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });
});


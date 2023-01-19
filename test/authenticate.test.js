const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = "localhost:3000";
chai.use(chaiHttp);

describe('Authenticate', () => {
    it('should return a JWT token when a valid email and password are provided', (done) => {
        chai.request(server)
            .post('/api/authenticate')
            .send({email: 'test@email.com', password: 'Password@123'})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('token');
                done();
            });
    });

    it('should return a 401 status code when an invalid email or password is provided', (done) => {
        chai.request(server)
            .post('/api/authenticate')
            .send({email: 'test@email.com', password: 'wrongpassword'})
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.have.property('error');
                done();
            });
    });

    it('should return a 401 status code when no email and password are provided', (done) => {
        chai.request(server)
            .post('/api/authenticate')
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.have.property('error');
                done();
            });
    });
});

const chai = require('chai');
const chaiHttp = require('chai-http');
// const server = require('../index');
const should = chai.should();

const server = "localhost:3000";

chai.use(chaiHttp);

describe('Posts', () => {
    let token;
    let postId;

    before((done) => {
        chai.request(server)
            .post('/api/authenticate')
            .send({email: 'test@email.com', password: 'Password@123'})
            .end((err, res) => {
                token = res.body.token;
                done();
            });
    });

    it('should return a 201 status code when creating a new post', (done) => {
        chai.request(server)
            .post('/api/posts')
            .set('Authorization', `${token}`)
            .send({title: 'Test Post', description: 'This is a test post'})
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property('postId');
                res.body.should.have.property('title').eql('Test Post');
                res.body.should.have.property('description').eql('This is a test post');
                postId = res.body.postId;
                done();
            });
    });

    it('should return a 200 status code when deleting a post', (done) => {
        let id;
        chai.request(server)
        .post('/api/posts')
        .set('Authorization', `${token}`)
        .send({title: 'Test Post', description: 'This is a test post'})
        .end((err, res) => {
            res.should.have.status(201);
            res.body.should.have.property('postId');
            res.body.should.have.property('title').eql('Test Post');
            res.body.should.have.property('description').eql('This is a test post');
            id = res.body.postId;
        });
        chai.request(server)
            .delete(`/api/posts/${id}`)
            .set('Authorization', `${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('message').eql('Successfully deleted the post');
                done();
            });
    });

    it('should return a 200 status code and the post information when getting a post by id', (done) => {
        chai.request(server)
            .get(`/api/posts/${postId}`)
            .set('Authorization', `${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('id').eql(postId);
                res.body.should.have.property('likes').eql(0);
                res.body.should.have.property('comments').be.a('array');
                done();
            });
    });

    it('should return a 200 status code and an array of all posts created by the authenticated user when getting all posts', (done) => {
        chai.request(server)
            .get('/api/all_posts').set('Authorization', `${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.posts.should.be.a('array');
                done();
            });
    });

    it('should return a 201 status code when liking a post', (done) => {
        chai.request(server)
            .post(`/api/like/${postId}`)
            .set('Authorization', `${token}`)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property('message').eql('Post liked');
                done();
            });
    });
});

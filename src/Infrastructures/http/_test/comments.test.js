const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/threadId/comments endpoint', () => {
  let token = '';
  let thread = {};
  let comment = {};

  beforeAll(async () => {
    const requestPayload = {
      username: 'dicoding',
      password: 'secret',
    };
    const server = await createServer(container);
    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });
    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    token = responseJson.data.accessToken;
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/threadId/comments', () => {
    it('should response 201 and persisted comments', async () => {
      // Arrange
      const requestPayload = {
        title: 'integration test threads',
        body: 'body',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      thread = responseJson.data.addedThread;

      const commentRequestPayload = {
        content: 'sebuah comment',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${thread.id}/comments`,
        payload: commentRequestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const commentResponseJson = JSON.parse(commentResponse.payload);
      comment = commentResponseJson.data.addedComment;
      expect(commentResponse.statusCode).toEqual(201);
      expect(commentResponseJson.status).toEqual('success');
      expect(commentResponseJson.data.addedComment).toBeDefined();
      expect(commentResponseJson.data.addedComment.id).toBeDefined();
      expect(commentResponseJson.data.addedComment.content).toEqual(commentRequestPayload.content);
      expect(commentResponseJson.data.addedComment.owner).toBeDefined();
    });

    it('should response 200 after deleting comment', async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread.id}/comments/${comment.id}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      expect(response.statusCode).toEqual(200);
      expect(response.result.status).toEqual('success');
    });
  });
});

const AddCommentUseCase = require('../AddCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const Comment = require('../../../Domains/comments/entities/Comment');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const userId = 'user-1';
    const useCasePayload = {
      content: 'content',
      threadId: 'thread-123',
    };
    const expectedAddedComment = {
      id: 'thread-123',
      content: useCasePayload.content,
      owner: userId,
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn(() => Promise.resolve({
      id: 'thread-123',
      content: useCasePayload.content,
      owner: userId,
    }));
    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());

    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePayload, userId);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(new Comment({
      content: useCasePayload.content,
      userId,
      threadId: useCasePayload.threadId,
    }));
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
  });
});

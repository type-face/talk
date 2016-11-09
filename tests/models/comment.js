require('../utils/mongoose');

const Comment = require('../../models/comment');
const User = require('../../models/user');
const Action = require('../../models/action');
const Setting = require('../../models/setting');

const settings = {id: '1', moderation: 'pre'};

const expect = require('chai').expect;

describe('Comment: models', () => {
  const comments = [{
    body: 'comment 10',
    asset_id: '123',
    status: '',
    parent_id: '',
    author_id: '123',
    id: '1'
  }, {
    body: 'comment 20',
    asset_id: '123',
    status: 'accepted',
    parent_id: '',
    author_id: '123',
    id: '2'
  }, {
    body: 'comment 30',
    asset_id: '456',
    status: '',
    parent_id: '',
    author_id: '456',
    id: '3'
  }];

  const users = [{
    id: '123',
    display_name: 'Ana',
  }, {
    id: '456',
    display_name: 'Maria',
  }];

  const actions = [{
    action_type: 'flag',
    item_id: '3',
    item_type: 'comment',
    user_id: '123'
  }, {
    action_type: 'like',
    item_id: '1',
    item_type: 'comment',
    user_id: '456'
  }];

  beforeEach(() => {
    return Setting.create(settings).then(() => {
      return Comment.create(comments);
    }).then(() => {
      return User.create(users);
    }).then(() => {
      return Action.create(actions);
    });
  });

  describe('#findById()', () => {
    it('should find a comment by id', () => {
      return Comment.findById('1').then((result) => {
        expect(result).to.not.be.null;
        expect(result).to.have.property('body', 'comment 10');
      });
    });
  });

  describe('#findByAssetId()', () => {
    it('should find an array of all comments by asset id', () => {
      return Comment.findAllByAssetId('123').then((result) => {
        expect(result).to.have.length(2);
        result.sort((a, b) => {
          if (a.body < b.body) {return -1;}
          else {return 1;}
        });
        expect(result[0]).to.have.property('body', 'comment 10');
        expect(result[1]).to.have.property('body', 'comment 20');
      });
    });
    it('should find an array of approved comments by asset id', () => {
      return Comment.findByAssetId('123').then((result) => {
        expect(result).to.have.length(1);
        result.sort((a, b) => {
          if (a.body < b.body) {return -1;}
          else {return 1;}
        });
        expect(result[0]).to.have.property('body', 'comment 20');
      });
    });
  });

  describe('#moderationQueue()', () => {
    it('should find an array of new comments to moderate when pre-moderation', () => {
      return Comment.moderationQueue('pre').then((result) => {
        expect(result).to.not.be.null;
        expect(result).to.have.lengthOf(2);
      });
    });
    it('should find an array of new comments to moderate when post-moderation', () => {
      return Comment.moderationQueue('post').then((result) => {
        expect(result).to.not.be.null;
        expect(result).to.have.lengthOf(1);
        expect(result[0]).to.have.property('body', 'comment 30');
      });
    });
    it('should find an array of new comments to moderate when pre-moderation in settings', () => {
      return Comment.moderationQueue().then((result) => {
        expect(result).to.not.be.null;
        expect(result).to.have.lengthOf(2);
      });
    });
    it('should find an array of new comments to moderate when post-moderation in settings', () => {
      return Comment.moderationQueue('post').then((result) => {
        expect(result).to.not.be.null;
        expect(result).to.have.lengthOf(1);
        expect(result[0]).to.have.property('body', 'comment 30');
      });
    });
    it('should fail when the moderation is not pre or post');
  });
});

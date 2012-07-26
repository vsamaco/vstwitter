var Tweet = Backbone.Model.extend({
  defaults: function() {
    return {
      name: 'User',
      message: '',
      timestamp: new Date()
    }
  }
});

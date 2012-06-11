var oauthModule = require('./oauth2');

var att = module.exports =
oauthModule.submodule('att')
  .configurable({
      scope: 'specify types of access: (no scope), SMS, addressbook, profile'
  })

  .oauthHost('https://auth.tfoundry.com')
  .apiHost('https://auth.tfoundry.com')

  .authPath('/oauth/authorize')
  .accessTokenPath('/oauth/token')

  .entryPath('/auth/att')
  .callbackPath('/auth/att/callback')

  .authQueryParam('response_type','code')


  .authQueryParam('scope', function () {
    return this._scope && this.scope();
  })
  .accessTokenHttpMethod('post')

  .fetchOAuthUser( function (accessToken) {
    var p = this.Promise();
debugger;
    this.oauth.get(this.apiHost() + '/me.json', accessToken, function (err, data) {
	
      if (err) return p.fail(err);
      var oauthUser = JSON.parse(data);
      p.fulfill(oauthUser);
    })
    return p;
  })
  .moduleErrback( function (err, seqValues) {
    if (err instanceof Error) {
      var next = seqValues.next;
      return next(err);
    } else if (err.extra) {
      var ghResponse = err.extra.res
        , serverResponse = seqValues.res;
      serverResponse.writeHead(
          ghResponse.statusCode
        , ghResponse.headers);
      serverResponse.end(err.extra.data);
    } else if (err.statusCode) {
      var serverResponse = seqValues.res;
      serverResponse.writeHead(err.statusCode);
      serverResponse.end(err.data);
    } else {
      console.error(err);
      throw new Error('Unsupported error type');
    }
  });

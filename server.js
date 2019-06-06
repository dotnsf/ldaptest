//. server.js
var ldap = require( 'ldapjs' );
var server = ldap.createServer();
server.listen( 1389, function(){
  console.log( server.url );
});

//. bind
server.bind( 'cn=root', function( req, res, next ){
  if( req.dn.toString() !== 'cn=root' || req.credentials !== 'secret' ){
    return next( new ldap.InvalidCredentialsError() );
  }

  res.end();
  return next();
});

//. authorize
function authorize( req, res, next ){
  if( !req.connection.ldap.bindDN.equals( 'cn=root' ) ){
    return next( new ldap.InsufficientAccessRightsError() );
  }

  return next();
}

//.load password
function loadPassword( req, res, next ){
  req.users = {};

  for( var i = 0; i < 10; i ++ ){
    req.users['user'+i] = {
      dn: 'cn=user' + i + ', ou=users, o=myhost',
      attributes: {
        cn: 'User ' + i,
        uid: 'user' + i,
        gid: 'user' + i,
        description: 'User ' + i,
        homedirectory: '/home/user' + i,
        shell: '/bin/bash',
        objectclass: 'unixUser'
      }
    };
  }

  return next();
}

//. search
var pre = [authorize, loadPassword];
server.search( 'o=myhost', pre, function( req, res, next ){
  Object.keys( req.users ).forEach( function( k ){
    if( req.filter.matches( req.users[k].attributes ) ){
      res.send( req.users[k] );
    }
  });

  res.end();
  return next();
});




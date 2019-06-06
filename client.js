//. client.js
var ldap = require( 'ldapjs' );
var assert = require( 'assert' );
var client = ldap.createClient({
  url: 'ldap://localhost:1389'
});

client.bind( 'cn=root', 'secret', function( err ){
  assert.ifError( err );
});

var opts = {
  filter: '(objectclass=*)',
  scope: 'sub',
  attributes: [ 'dn', 'sn', 'cn' ]
};

client.search( 'o=myhost', opts, function( err, res ){
  assert.ifError( err );

  res.on( 'searchEntry', function( entry ){
    console.log( 'entry: ' + JSON.stringify( entry.object ) );
  });
  res.on( 'searchReference', function( referral ){
    console.log( 'referral: ' + referral.uris.join() );
  });
  res.on( 'error', function( err ){
    console.log( 'error: ' + err.message );
  });
  res.on( 'end', function( result ){
    console.log( 'status: ' + result.status );
  });
});



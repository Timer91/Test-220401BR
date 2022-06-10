const API = "http://localhost:3000"

async function myFetch( url, { method="GET", headers, body } = {} ) {
    return fetch( `${API}${url}`, { method, headers, body } )
        .then( res => {
            if ( res.status === 200 ) {
                return res.json();
            }
            return res.text();
        } );
}

function getRefreshToken( { user, password } ) {
    return myFetch( "/login",
        {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic QmFua2luQ2xpZW50SWQ6c2VjcmV0"
            },
            body: JSON.stringify( { user, password } )
        } );
}

async function getAccessToken( refreshToken ) {
    const urlEncoded = new URLSearchParams();
        
    urlEncoded.append( "grant_type", "refresh_token");
    urlEncoded.append( "refresh_token", refreshToken );
        
    return myFetch( "/token",
        {
            method:"POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: urlEncoded
        } );
}

async function getAccounts( accessToken ) {
    return myFetch( "/accounts",
        {
            method:"GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        } );
}

async function getTransactionsByAccount( accessToken, accNumber ) {
    return myFetch( `/accounts/${accNumber}/transactions`,
        {
            method:"GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        } );
}

getRefreshToken( { user:"BankinUser", password: "12345678" } )
    .then( async ( { refresh_token } ) => {
        const
            { access_token } = await getAccessToken( refresh_token ),
            { account, link } = await getAccounts( access_token ),
            result = []
        ;
        
        for ( const a of account ) {
            delete a.currency;
            
            const { transactions, link } = await getTransactionsByAccount(
                access_token, a.acc_number );

            result.push( { ...a, transactions } );
        }
        
        console.log( result );
    } );

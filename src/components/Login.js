import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode  from 'jwt-decode';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

//the actual setter "setUser" is created in a useState hook in App
function Login({ setUser }) {
    /*
        This takes the JWT credential that will be passed as part of the response, parses it with jwt_decode, and then uses that object to create the loginData object. Notably, we're using the tokenData.sub field to stand in for our googleId value. The sub field uniquely corresponds to users, so this should work. Our application depends on googleId elsewhere so we want to keep the naming consistent here.
    */
    const onSuccess = (res) => {
        var tokenData = jwt_decode(res.credential);
        var loginData = {
          googleId: tokenData.sub,
          ...tokenData
        }
        setUser(loginData);
        localStorage.setItem("login", JSON.stringify(loginData));
      };

    const onFailure = (res) => {
        console.log('Login failed: res:', res);
    }

    return (//returns the component to be rendered and exports as Login
        <div>
            <GoogleLogin
                clientId={clientId}
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                style={{ marginTop: '100px' }}
                isSignedIn={true}
                auto_select={true}
            />
        </div>
    );
}

export default Login;
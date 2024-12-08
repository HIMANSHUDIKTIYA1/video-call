"use client";

import React, { useState } from 'react';

import Second from '../components/Second';
 import First from '../components/First' ;

const App = () => {
  const [userInfo, setUserInfo] = useState(null);

  return (
    <div>
      {!userInfo ? (
        <First setUserInfo={setUserInfo} />
      ) : (
        <Second userInfo={userInfo} />
      )}
    </div>
  );
};

export default App;

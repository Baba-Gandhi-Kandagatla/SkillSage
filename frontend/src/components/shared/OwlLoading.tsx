import React from 'react';
// import './OwlLoading.css'; // Removed external CSS import

const styles: { [key: string]: React.CSSProperties } = {
  owlLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f0f0f0', // Example background color
  },
  owl: {
    position: 'relative',
    width: '100px',
    height: '100px',
  },
  owlHead: {
    position: 'absolute',
    top: '10px',
    left: '25px',
    width: '50px',
    height: '50px',
    background: 'grey',
    borderRadius: '50%',
  },
  owlEye: {
    position: 'absolute',
    top: '15px',
    width: '10px',
    height: '10px',
    background: 'white',
    borderRadius: '50%',
  },
  owlEyeLeft: {
    left: '15px',
  },
  owlEyeRight: {
    right: '15px',
  },
  owlBeak: {
    position: 'absolute',
    top: '30px',
    left: '20px',
    width: '10px',
    height: '10px',
    background: 'darkgrey',
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  },
  owlBody: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '60px',
    background: 'grey',
    borderRadius: '50% 50% 0 0',
    animation: 'rotate 2s linear infinite',
  },
  owlWing: {
    position: 'absolute',
    width: '30px',
    height: '30px',
    background: 'lightgrey',
    borderRadius: '50%',
  },
  owlWingLeft: {
    top: '10px',
    left: '-15px',
    transform: 'rotate(-45deg)',
  },
  owlWingRight: {
    top: '10px',
    right: '-15px',
    transform: 'rotate(45deg)',
  },
  owlLegs: {
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  owlLeg: {
    width: '2px',
    height: '10px',
    background: 'darkgrey',
    margin: '0 5px',
    animation: 'blink 1s infinite',
  },
};

const OwlLoading = () => {
  return (
    <>
      <style>
        {`
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes blink {
            0%, 100% { height: 10px; }
            50% { height: 5px; }
          }
        `}
      </style>
      <div style={styles.owlLoading}>
        <div style={styles.owl}>
          <div style={styles.owlBody}>
            <div style={styles.owlHead}>
              <div style={{ ...styles.owlEye, ...styles.owlEyeLeft }}></div>
              <div style={{ ...styles.owlEye, ...styles.owlEyeRight }}></div>
              <div style={styles.owlBeak}></div>
            </div>
            <div style={{ ...styles.owlWing, ...styles.owlWingLeft }}></div>
            <div style={{ ...styles.owlWing, ...styles.owlWingRight }}></div>
          </div>
          <div style={styles.owlLegs}>
            <div style={styles.owlLeg}></div>
            <div style={styles.owlLeg}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OwlLoading;

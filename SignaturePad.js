import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Button, Dimensions, Alert } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

const SignaturePad = forwardRef((_, ref) => {
  const [lines, setLines] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const canvasRef = useRef(null);
  const emptyCanvasRef = useRef(null); // Reference for an empty canvas

  useImperativeHandle(ref, () => ({
    saveSignature,
  }));

  const clearSignature = () => {
    setLines([]);
    setCurrentPath('');
  };

  const handlePan = (event) => {
    const { nativeEvent: { x, y } } = event;
    setCurrentPath(prevPath => `${prevPath} ${x},${y}`);
  };

  const handlePanStateChange = (event) => {
    const { nativeEvent: { state } } = event;
    if (state === 'END') {
      setLines([...lines, currentPath]);
      setCurrentPath('');
    }
  };

  const saveSignature = async () => {
    try {
      // Capture the empty canvas to compare later
      const emptyUri = await captureRef(emptyCanvasRef, {
        format: 'png',
        quality: 1,
      });

      // Capture the current signature canvas
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
      });

      // Convert the captured empty canvas to base64
      const emptyBase64 = await fetch(emptyUri)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          return new Promise((resolve) => {
            reader.onloadend = () => {
              const base64data = reader.result.split(',')[1];
              resolve(base64data);
            };
          });
        });

      // Convert the captured signature to base64
      const signatureBase64 = await fetch(uri)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          return new Promise((resolve) => {
            reader.onloadend = () => {
              const base64data = reader.result.split(',')[1];
              resolve(base64data);
            };
          });
        });

      // Check if the signature is non-empty
      if (signatureBase64 !== emptyBase64) {
        return signatureBase64; // Return the non-empty signature
      } else {
        Alert.alert('Signature is empty', 'Please provide a signature before saving.');
        return null; // Return null if the signature is empty
      }
    } catch (error) {
      console.log('Failed to save signature:', error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <PanGestureHandler onGestureEvent={handlePan} onHandlerStateChange={handlePanStateChange}>
          <View ref={canvasRef} style={styles.signaturePad}>
            <Svg style={styles.svg}>
              {lines.map((path, index) => (
                <Path key={index} d={`M${path.trim().replace(/ /g, ' L')}`} stroke="black" strokeWidth="2" fill="none" />
              ))}
              {currentPath && (
                <Path d={`M${currentPath.trim().replace(/ /g, ' L')}`} stroke="black" strokeWidth="2" fill="none" />
              )}
            </Svg>
          </View>
        </PanGestureHandler>
        <View style={styles.buttonContainer}>
          <Button title="Clear" onPress={clearSignature} />
        </View>

        {/* Hidden empty canvas for comparison */}
        <View ref={emptyCanvasRef} style={[styles.signaturePad, { position: 'absolute', top: -1000, left: -1000 }]}>
          <Svg style={styles.svg}></Svg>
        </View>
      </View>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signaturePad: {
    width: Dimensions.get('window').width - 40,
    height: 200,
    borderWidth: 1,
    borderColor: 'black',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export { SignaturePad };

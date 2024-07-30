import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Button, Dimensions } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

const SignaturePad = forwardRef((_, ref) => {
  const [lines, setLines] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const canvasRef = useRef(null);

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
    if (lines.length === 0 && currentPath === '') {
      return null;  // No signature drawn
    }

    try {
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
      });
      console.log('Captured URI:', uri); // Log the captured URI
      const base64 = await fetch(uri)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          return new Promise((resolve) => {
            reader.onloadend = () => {
              const base64data = reader.result;
              resolve(base64data.split(',')[1]); // Remove the data:image/png;base64, prefix
            };
          });
        });
      console.log('Generated Base64:', base64); // Log the generated Base64 string
      return base64;
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

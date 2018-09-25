import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Expo ARKit</Text>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#c0c5c1',
    flex: 1,
    justifyContent: 'center'
  }
});

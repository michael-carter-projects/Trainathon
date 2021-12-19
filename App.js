import { StatusBar } from 'expo-status-bar';
import React, { useState, useReducer } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const goals = [
  [3, 3, 4],
  [3, 3, 5],
  [3, 3, 6],
  [3, 3, 3],
  [4, 4, 8],
  [4, 4, 10],
  [4, 4, 12],
  [4, 4, 4],
  [5, 5, 14],
  [5, 5, 16],
  [5, 5, 18],
  [5, 5, 5],
  [6, 6, 20],
  [6, 6, 20],
  [6, 6, 12],
  [4, 4, 26.2],
];
var milestones_g = [
  [1, 1, 1],
  [1, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];
var best_time = '∞ : ∞ : ∞';

export default function App() {

  const [milestones, setMilestones] = useState(milestones_g);
  const [ignored,    forceUpdate  ] = useReducer(x => x + 1, 0);

  function get_box_style(indices) {
    if (milestones[indices.i][indices.j] === 1) {

      let num  = (indices.i*3)+indices.j+1
      let frac = num / 48;

      let r1 = 150 - frac*180;
      let g1 = 180 + frac*20;
      let b1 = 280 - frac*200;

      let r2 =  80 - frac*180;
      let g2 = 110 + frac*20;
      let b2 = 210 - frac*200;

      let bgColor = 'rgba('+r1.toString()+', '+g1.toString()+', '+b1.toString()+',1)';
      let borderColor = 'rgba('+r2.toString()+', '+g2.toString()+', '+b2.toString()+',1)';

      return [styles.complete_box, {backgroundColor:bgColor, borderColor:borderColor}];
    }
    else {
      return styles.incomplete_box;
    }
  }
  function get_text_style(complete) {
    if (complete === 1) {
      return styles.complete_text;
    }
    else {
      return styles.incomplete_text;
    }
  }
  function update_milestones(indices) {

    let new_milestones = milestones;

    if (milestones[indices.i][indices.j] === 0) {
      new_milestones[indices.i][indices.j] = 1;
    }
    else {
      new_milestones[indices.i][indices.j] = 0;
    }
    setMilestones(new_milestones);
    forceUpdate();
  }

  function Box(indices) {

    return (
      <TouchableOpacity style={{flex:1}} onPress={() => {update_milestones(indices); setMilestones(milestones);}}>
        <View style={get_box_style(indices)}>
          <Text style={get_text_style(milestones[indices.i][indices.j])}>
            {goals[indices.i][indices.j] + ' miles'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  function Row(i) {

    return (
      <View style={styles.row}>
        <Box key={0} i={i.i} j={0}/>
        <Box key={1} i={i.i} j={1}/>
        <Box key={2} i={i.i} j={2}/>
      </View>
    );
  }

  return (
    <View style={{flex:1, backgroundColor:'rgba(50,50,50,1)'}}>
      <SafeAreaView style={styles.container}>

        <View style={styles.title_bar}>
          <Text style={{fontSize: 20, color:'#fff'}}>Trainathon</Text>
        </View>

        <View style={styles.scrollview}>

            <Row style={{flex:1}} i={ 0}/>
            <Row style={{flex:1}} i={ 1}/>
            <Row style={{flex:1}} i={ 2}/>
            <Row style={{flex:1}} i={ 3}/>
            <Row style={{flex:1}} i={ 4}/>
            <Row style={{flex:1}} i={ 5}/>
            <Row style={{flex:1}} i={ 6}/>
            <Row style={{flex:1}} i={ 7}/>
            <Row style={{flex:1}} i={ 8}/>
            <Row style={{flex:1}} i={ 9}/>
            <Row style={{flex:1}} i={10}/>
            <Row style={{flex:1}} i={11}/>
            <Row style={{flex:1}} i={12}/>
            <Row style={{flex:1}} i={13}/>
            <Row style={{flex:1}} i={14}/>
            <Row style={{flex:1}} i={15}/>

            <View style={styles.best_time}>
              <Text style={styles.incomplete_text}>{'Best: ' + best_time}</Text>
            </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const screen_width  = Dimensions.get('window').width;
const screen_height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'rgba(40,40,40,1)'
  },
  title_bar: {
    flex:1,
    alignItems: 'center',
    backgroundColor:'rgba(40,40,40,1)'
  },
  scrollview: {
    flex:20,
    backgroundColor: 'rgba(100,100,100,1)',
    height: screen_height - 50,
  },
  complete_box: {
    flex: 1,
    marginLeft:  2.5,
    marginRight: 2.5,
    marginTop:   5,
    backgroundColor: 'rgba(60,180,50,1)',
    borderColor:     'rgba(0,100,0,1)',
    borderWidth:  4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomplete_box: {
    flex: 1,
    marginLeft:  2.5,
    marginRight: 2.5,
    marginTop:   5,
    backgroundColor: 'rgba(200,200,200,1)',
    borderColor:     'rgba(150,150,150,1)',
    borderWidth:  4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  complete_text: {
    color: 'rgba(255,255,255,1)',
    fontSize: 20,
  },
  incomplete_text: {
    color: 'rgba(10,10,10,1)',
    fontSize: 20,
  },
  best_time: {
    flex: 1,
    margin:  5,
    backgroundColor: 'rgba(200,200,200,1)',
    borderColor:     'rgba(150,150,150,1)',
    borderWidth:  4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flex:1,
    flexDirection: 'row',
    marginLeft: 2.5,
    marginRight: 2.5,
  }
});

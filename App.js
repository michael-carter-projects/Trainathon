import { StatusBar } from 'expo-status-bar';

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


function two_D_arr_to_str(array) {

  var string_array = '[\n';

  for (let i=0; i<array.length; i++) {

    string_array += '[';

    for (let j=0; j<array[i].length; j++) {
      string_array += array[i][j];
      if (j !== array[i].length-1) {
        string_array += ',';
      }
    }

    string_array += ']';
    string_array += ',\n'
  }

  string_array += ']';

  return string_array;
}

function str_to_two_D_arr(string) {

  var two_D_arr = [];
  var last_semicolon_index = 0;

  string = string.replaceAll('],', ';');
  string = string.replaceAll('[', '');
  string = string.replaceAll(']', '');
  string = string.replaceAll(/\n/g, '');
  string = ';' + string;

  for (let i=0; i<string.length; i++) {

    if (string[i] === ';' && i !== last_semicolon_index) {

      var one_D_arr = [];
      var last_comma_index = last_semicolon_index;

      for (let j=last_semicolon_index+1; j<=i; j++) {

        var number = '';

        if (string[j] === ',' || string[j] === ';') {
          number = string.substring(last_comma_index+1, j);
          one_D_arr.push(parseInt(number));
          last_comma_index = j;
        }
      }

      last_semicolon_index = i;
      two_D_arr.push(one_D_arr);
    }
  }
  return two_D_arr;
}

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
  [1, 1, 0],
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

  const [ignored,    forceUpdate  ] = useReducer(x => x + 1, 0);
  const [milestones, setMilestones] = useState(milestones_g);



  /*const pressHandler = key => {
      console.log('Milestones BEFORE delete');
      console.log(milestones);

      const newMilestones = milestones.filter(milestone => milestone.key !== milestone);

      console.log('Milestones AFTER delete');
      console.log(milestones);

      setMilestones(newMilestones);
      storeMilestonesInAsync(newMilestones);
    };
    const submitHandler = text => {
      //if (text.length === 0) return;

      //const key = Math.random().toString();

      console.log('Milestones BEFORE submit');
      console.log(milestones);

      const newMilestones = [{ text, key }, ...milestones];

      console.log('Milestones AFTER submit');
      console.log(milestones);

      setMilestones(newMilestones);
      storeMilestonesInAsync(newMilestones);
    };*/
  useEffect(() => {
    restoreMilestonesFromAsync();
  }, []);

  const asyncStorageKey = '@milestones';

  function pressHandler(indices) {

    let new_milestones = milestones;
    if (milestones[indices.i][indices.j] === 0) {
      new_milestones[indices.i][indices.j] = 1;
    }
    else {
      new_milestones[indices.i][indices.j] = 0;
    }
    setMilestones(new_milestones);
    storeMilestonesInAsync(new_milestones);
    forceUpdate();
  };

  const storeMilestonesInAsync = newMilestones => {

    const stringifiedMilestones = two_D_arr_to_str(newMilestones);

    AsyncStorage.setItem(asyncStorageKey, stringifiedMilestones).catch(err => {
      console.warn('Error storing milestones in Async');
      console.warn(err);
    });
  };

  const restoreMilestonesFromAsync = () => {
    AsyncStorage.getItem(asyncStorageKey)
      .then(stringifiedMilestones => {
        console.log('Restored Milestones:');
        console.log(stringifiedMilestones);

        const parsedMilestones = str_to_two_D_arr(stringifiedMilestones);

        if (!parsedMilestones) return;

        setMilestones(parsedMilestones);
      })
      .catch(err => {
        console.warn('Error restoring milestones from async');
        console.warn(err);
      });
  };



  function get_box_style(indices, week_complete) {

    if (week_complete !== null && week_complete === 0) {
        return styles.incomplete_box;
    }
    if (milestones[indices.i][indices.j] === 1 || week_complete === 1) {

      let num  = (indices.i*4)+indices.j+1
      let frac = num / 64;

      let r1 = 120 - frac*200;
      let g1 = 130 + frac*20;
      let b1 = 230 - frac*150;

      let r2 =  50 - frac*200;
      let g2 =  90 + frac*20;
      let b2 = 190 - frac*150;

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



  function Box(indices) {

    if (indices.j === 3) {
      var week_complete = (milestones[indices.i][0]
                        && milestones[indices.i][1]
                        && milestones[indices.i][2]);
      return (
        <View style={{flex:1}} style={get_box_style(indices, week_complete)}>
          <Text style={get_text_style(week_complete)}>
            {'Week '+(indices.i+1)}
          </Text>
        </View>
      );
    }
    else {
      return (
        <TouchableOpacity style={{flex:1}} onPress={() => pressHandler(indices)}>
          <View style={get_box_style(indices, null)}>
            <Text style={get_text_style(milestones[indices.i][indices.j])}>
              {goals[indices.i][indices.j] + ' miles'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }

  function Row(i) {

    return (
      <View style={styles.row}>
        <Box key={0} i={i.i} j={0}/>
        <Box key={1} i={i.i} j={1}/>
        <Box key={2} i={i.i} j={2}/>
        <Box key={3} i={i.i} j={3}/>
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
      <StatusBar style="light"/>
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
    bottom: 6,
    backgroundColor:'rgba(40,40,40,1)'
  },
  scrollview: {
    flex:25,
    backgroundColor: 'rgba(40,40,40,1)',
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
    borderRadius: 100,
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
    fontSize: 16,
  },
  incomplete_text: {
    color: 'rgba(10,10,10,1)',
    fontSize: 16,
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

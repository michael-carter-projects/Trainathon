import { StatusBar }     from 'expo-status-bar';
import * as Font         from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';


import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { Alert, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


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
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];


var best_hr  = '∞';
var best_min = '∞';
var best_sec = '∞';
var best_time = best_hr + ' : ' + best_min + ' : ' + best_sec;

export default function App() {

  // ===============================================================================================
  // HOOKS FOR STORING AND UPDAING INFO
  const [appIsReady,   setAppIsReady  ] = useState(false);
  const [ignored,      forceUpdate    ] = useReducer(x => x + 1, 0);
  const [milestones,   setMilestones  ] = useState(milestones_g);
  const [showEditView, setShowEditView] = useState()
  const [hourBox,      setHourBox     ] = useState('');
  const [minuteBox,    setMinuteBox   ] = useState('');
  const [secondBox,    setSecondBox   ] = useState('');
  const [interval,     setInterval    ] = useState(0);
  const [bestTime,     setBestTime    ] = useState(best_time);
  // ASYNC STORAGE KEYS ----------------------------------------------------------------------------
  const milestonesAsyncKey = '@milestones';
  const bestTimeAsyncKey   = '@bestTime';
  // UPDATE MILESTONES HOOKS -----------------------------------------------------------------------
  function updateMilestones(indices) {

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
  // STORE NEW MILESTONES IN ASYNC STORAGE ---------------------------------------------------------
  const storeMilestonesInAsync = newMilestones => {

    const stringifiedMilestones = two_D_arr_to_str(newMilestones);

    AsyncStorage.setItem(milestonesAsyncKey, stringifiedMilestones).catch(err => {
      console.warn('Error storing milestones in Async');
      console.warn(err);
    });
  };
  // UPDATE THE BEST TIME HOOKS --------------------------------------------------------------------
  function update_best_time() {
    setBestTime(hourBox+':'+minuteBox+':'+secondBox);
    storeBestTimeInAsync()
    forceUpdate();
    setShowEditView(false);
  }
  // STORE NEW BEST TIME IN ASYNC STORAGE ----------------------------------------------------------
  const storeBestTimeInAsync = newMilestones => {

    AsyncStorage.setItem(bestTimeAsyncKey, bestTime).catch(err => {
      console.warn('Error storing best time in Async');
      console.warn(err);
    });
  };
  // RESTORE MILESTONES AND BEST TIME FROM ASYNC STORAGE -------------------------------------------
  const restoreDataFromAsync = () => {
    AsyncStorage.getItem(milestonesAsyncKey)
      .then(stringifiedMilestones => {
        const parsedMilestones = str_to_two_D_arr(stringifiedMilestones);
        if (!parsedMilestones) return;
        setMilestones(parsedMilestones);
      })
      .catch(err => {
        console.warn('Error restoring milestones from async');
        console.warn(err);
      });
    AsyncStorage.getItem(bestTimeAsyncKey)
      .then(stringifiedBestTime => {
        if (!stringifiedBestTime) return;
        setBestTime(stringifiedBestTime);
      })
      .catch(err => {
        console.warn('Error restoring best time from async');
        console.warn(err);
      });
  };


  // LOAD ASSETS DURING SPLASH SCREEN ==============================================================
  useEffect(() => {
    async function prepare() {

      // LOAD ALL OTHER ASSETS WHILE SPLASH SCREEN IS SHOWING ------------------
      try {
        // LOAD FONTS ----------------------------------------------------------
        await Font.loadAsync({
          Comfortaa_300: require('./assets/fonts/Comfortaa-300.ttf'),
          Comfortaa_400: require('./assets/fonts/Comfortaa-400.ttf'),
          Comfortaa_500: require('./assets/fonts/Comfortaa-500.ttf'),
          Comfortaa_600: require('./assets/fonts/Comfortaa-600.ttf'),
          Comfortaa_700: require('./assets/fonts/Comfortaa-700.ttf'),
        });

        restoreDataFromAsync();

      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();


  }, []);
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);
  if (!appIsReady) { return null; }

  // ===============================================================================================
  // RETURNS STYLE FOR CHECKBOXES ------------------------------------------------------------------
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
  // RETURNS TEXT STYLE FOR CHECKBOXES -------------------------------------------------------------
  function get_text_style(complete) {
    if (complete === 1) {
      return styles.complete_text;
    }
    else {
      return styles.incomplete_text;
    }
  }

  // ===============================================================================================
  // ALERT USER TO INPUT A DIFFERENT NUMBER --------------------------------------------------------
  function alert_bad_number() {
    Alert.alert(
      "Invalid Value",
      "Enter a two digit number less than 60",
      [ { text: "Ok" } ]
    );
  }
  // DELETE FROM NUMBER FIELD ----------------------------------------------------------------------
  function delete_from_number(interval) {
    if      (interval === 1) {
      if (hourBox.length > 1) {
        setHourBox(hourBox.substring(0, hourBox.length-1));
      }
      else {
        setHourBox('');
      }
    }
    else if (interval === 2) {
      if (minuteBox.length > 1) {
        setMinuteBox(minuteBox.substring(0, minuteBox.length-1));
      }
      else {
        setMinuteBox('');
      }
    }
    else if (interval === 3) {
      if (secondBox.length > 1) {
        setSecondBox(secondBox.substring(0, secondBox.length-1));
      }
      else {
        setSecondBox('');
      }
    }
  }
  // ADD TO NUMBER FIELD ---------------------------------------------------------------------------
  function add_to_number(interval, number) {

    if      (interval === 1) {
      if (hourBox+number > 59 || hourBox.length == 2) {
        alert_bad_number();
      }
      else {
        setHourBox(hourBox+number);
      }
    }
    else if (interval === 2) {
      if (minuteBox+number > 59 || minuteBox.length == 2) {
        alert_bad_number();
      }
      else {
        setMinuteBox(minuteBox+number);
      }
    }
    else if (interval === 3) {
      if (secondBox+number > 59 || secondBox.length == 2) {
        alert_bad_number();
      }
      else {
        setSecondBox(secondBox+number);
      }
    }
  }
  // UPDATE CURRENT TIME BOX BASED ON BOX AND NUMBER INPUT -----------------------------------------
  function set_time_box(int, number) {
    setInterval(int);

    if (number === -1) {
      delete_from_number(int);
    }
    else {
      add_to_number(int, number)
    }
  }
  // GET STYLE FOR NUMBER INPUT BOX ----------------------------------------------------------------
  function get_number_input_style(box) {
    if (interval === box) {
      return {
        backgroundColor: 'rgba(180,200,255,1)',
        borderColor:     'rgba( 80,150,255,1)',
        color:           'rgba(  0,100,200,1)',
      }
    }
    else {
      return null;
    }
  }

  // ===============================================================================================
  // ENTRY BOXES FOR BEST TIME ---------------------------------------------------------------------
  function BestTimeEntryBox() {
    return (
      <View style={{width:screen_width, height:screen_height/10, flexDirection:'row'}}>
        <TouchableOpacity style={[styles.number_button, get_number_input_style(1)]} onPress={() => setInterval(1)}>
          <Text style={[styles.number_text, {fontSize:24}, get_number_input_style(1)]}>{hourBox}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.number_button, get_number_input_style(2)]} onPress={() => setInterval(2)}>
          <Text style={[styles.number_text, {fontSize:24}, get_number_input_style(2)]}>{minuteBox}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.number_button, get_number_input_style(3)]} onPress={() => setInterval(3)}>
          <Text style={[styles.number_text, {fontSize:24}, get_number_input_style(3)]}>{secondBox}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // NUMBER PAD FOR ENTERING BEST TIME -------------------------------------------------------------
  function NumberPad() {
    return (
      <View style={{width:screen_width, height:screen_height/3}}>

        <View style={{width:screen_width, flexDirection:'row'}}>
          <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 1)}>
            <Text style={styles.number_text}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 2)}>
            <Text style={styles.number_text}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 3)}>
            <Text style={styles.number_text}>3</Text>
          </TouchableOpacity>
        </View>

        <View style={{width:screen_width, flexDirection:'row'}}>
          <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 4)}>
            <Text style={styles.number_text}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 5)}>
            <Text style={styles.number_text}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 6)}>
            <Text style={styles.number_text}>6</Text>
          </TouchableOpacity>
        </View>

        <View style={{width:screen_width, flexDirection:'row'}}>
          <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 7)}>
            <Text style={styles.number_text}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 8)}>
            <Text style={styles.number_text}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 9)}>
            <Text style={styles.number_text}>9</Text>
          </TouchableOpacity>
        </View>

        <View style={{width:screen_width, flexDirection:'row'}}>
          <View style={styles.number_button}/>

            <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, 0)}>
              <Text style={styles.number_text}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.number_button} onPress={() => set_time_box(interval, -1)}>
              <Text style={styles.number_text}>{'<x'}</Text>
            </TouchableOpacity>

          </View>
      </View>
    );
  }
  // RENDER THE CANCEL AND ENTER BUTTONS -----------------------------------------------------------
  function CancelEnter() {
    return (
      <View style={{width:screen_width, height:screen_height/10, flexDirection:'row'}}>
        <TouchableOpacity style={styles.cancel_button} onPress={() => setShowEditView(0)}>
          <Text style={styles.submit_text}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submit_button} onPress={() => update_best_time()}>
          <Text style={styles.submit_text}>Enter</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // SHOW THE BEST TIME EDITOR ---------------------------------------------------------------------
  function EditBestTimeView() {
    return (
      <View style={styles.edit_best_time_view}>
        <Text style={styles.enter_new_time}>Enter new best time</Text>
        <BestTimeEntryBox/>
        <NumberPad/>
        <CancelEnter/>
      </View>
    );
  }

  // ===============================================================================================
  // RENDER A SINGLE MILES CHECKBOX ----------------------------------------------------------------
  function Box(indices) {

    if (indices.j === 3) {
      var week_complete = (milestones[indices.i][0]
                        && milestones[indices.i][1]
                        && milestones[indices.i][2]);
      return (
        <View style={{flex:1}} style={get_box_style(indices, week_complete)}>
          <Text style={[get_text_style(week_complete), {fontSize:16}]}>
            {'Week '+(indices.i+1)}
          </Text>
        </View>
      );
    }
    else {
      return (
        <TouchableOpacity style={{flex:1}} onPress={() => updateMilestones(indices)}>
          <View style={get_box_style(indices, null)}>
            <Text style={get_text_style(milestones[indices.i][indices.j])}>
              { goals[indices.i][indices.j] !== 26.2 ? (goals[indices.i][indices.j]) : (goals[indices.i][indices.j])}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }
  // RENDER A ROW OF MILES CHECKBOXES --------------------------------------------------------------
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

  // RENDER THE WHOLE APP ==========================================================================
  return (
    <View style={{flex:1, backgroundColor:'rgba(50,50,50,1)'}}>
      <SafeAreaView style={styles.container}>

        <View style={styles.title_bar}>
          <Text style={styles.title_text}>trainathon</Text>
        </View>

        { !showEditView ? (
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

                <TouchableOpacity style={styles.best_time} onPress={() => setShowEditView(!showEditView)}>
                  <Text style={styles.incomplete_text}>{'Best Time: ' + bestTime}</Text>
                </TouchableOpacity>
            </View>
          ) : (
            <EditBestTimeView/>
          )
        }

      </SafeAreaView>
      <StatusBar style="light"/>
    </View>
  );
}

const screen_width  = Dimensions.get('window').width;
const screen_height = Dimensions.get('window').height;

const light_grey = 'rgba(200,200,200,1)';
const dark_grey  = 'rgba(150,150,150,1)';


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
  title_text: {
    fontSize: 26,
    color:'#fff',
    fontFamily: 'Comfortaa_700'
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
    backgroundColor: light_grey,
    borderColor:     dark_grey,
    borderWidth:  4,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  complete_text: {
    color: 'rgba(255,255,255,1)',
    fontSize: 18,
    fontFamily: 'Comfortaa_700',
    bottom:-1
  },
  incomplete_text: {
    color: 'rgba(10,10,10,1)',
    fontSize: 18,
    fontFamily: 'Comfortaa_500',
    bottom:-1
  },
  enter_new_time: {
    alignSelf: 'center',
    fontSize: 30,
    bottom: 30,
    color: 'rgba(255,255,255,1)',
    fontFamily: 'Comfortaa_400',
  },
  best_time: {
    flex: 1,
    margin:  5,
    backgroundColor: 'rgba(200,200,200,1)',
    borderColor:     'rgba(150,150,150,1)',
    borderWidth:  4,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flex:1,
    flexDirection: 'row',
    marginLeft: 2.5,
    marginRight: 2.5,
  },

  number_button: {
    flex: 1,
    height: screen_height/18,
    margin:10,
    backgroundColor: light_grey,
    borderColor:     dark_grey,
    borderWidth:  4,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number_text: {
    fontSize: 30,
    fontFamily: 'Comfortaa_700',
    bottom:-1
  },
  cancel_button: {
    flex: 1,
    height: screen_height/18,
    margin:10,
    backgroundColor: 'rgba(255,100, 0,1)',
    borderColor:     'rgba(235, 80, 0,1)',
    borderWidth:  4,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submit_button: {
    flex: 1,
    height: screen_height/18,
    margin:10,
    backgroundColor: 'rgba(50,120,255,1)',
    borderColor:     'rgba(30,100,235,1)',
    borderWidth:  4,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submit_text: {
    fontSize: 24,
    fontFamily: 'Comfortaa_700',
    bottom: -1,
    color: 'rgba(255,255,255,1)'
  },
});

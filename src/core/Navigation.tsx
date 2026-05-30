import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  RoundedRect,
  Path,
  Shadow,
  LinearGradient,
  Text as SkiaText,
} from '@shopify/react-native-skia';

import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { CollectionScreen } from '../screens/CollectionScreen';
import { ManageChildrenScreen } from '../screens/ManageChildrenScreen';
import { AddChildScreen } from '../screens/AddChildScreen';
import { DataManagementScreen } from '../screens/DataManagementScreen';
import { useColors, RADII } from '../theme/skiaTheme';

// --------------- Type definitions ---------------

export type HomeStackParamList = {
  Home: undefined;
  Collection: { childId: number; childName: string; childColor: string };
  ManageChildren: undefined;
};

export type SearchStackParamList = {
  Search: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AddChild: undefined;
} & HomeStackParamList & SearchStackParamList;

// --------------- Navigators ---------------

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// --------------- Skia Tab Bar Icons ---------------

const ICON_SIZE = 24;
const PAD = 3;

// House path (Home icon)
const HOME_PATH = `M4.00033 7H20.0003M5.00033 4H19.0003M6.89629 20H17.1044C18.1275 20 18.639 20 19.0447 19.8084C19.402 19.6396 19.7012 19.3687 19.9047 19.03C20.1358 18.6454 20.1867 18.1364 20.2885 17.1184L20.7365 12.6388C20.8279 11.7244 20.8736 11.2672 20.7236 10.9138C20.5918 10.6034 20.3593 10.3465 20.0635 10.1844C19.7268 10 19.2673 10 18.3484 10H5.6523C4.73336 10 4.27389 10 3.93718 10.1844C3.64141 10.3465 3.40887 10.6034 3.27708 10.9138C3.12706 11.2672 3.17278 11.7244 3.26422 12.6388L3.71218 17.1184C3.81398 18.1364 3.86488 18.6454 4.09593 19.03C4.29943 19.3687 4.59872 19.6396 4.95601 19.8084C5.36167 20 5.87321 20 6.89629 20ZM15.0003 15C15.0003 16.1046 13.6572 17 12.0003 17C10.3435 17 9.00033 16.1046 9.00033 15C9.00033 13.8954 10.3435 13 12.0003 13C13.6572 13 15.0003 13.8954 15.0003 15Z`;

// Magnifying glass path (Search icon)
const SEARCH_PATH = `M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12ZM5.07089 13C5.55612 16.3923 8.47353 19 12 19C15.5265 19 18.4439 16.3923 18.9291 13H14.8293C14.4174 14.1652 13.3062 15 12 15C10.6938 15 9.58251 14.1652 9.17068 13H5.07089ZM18.9291 11C18.4439 7.60771 15.5265 5 12 5C8.47353 5 5.55612 7.60771 5.07089 11H9.17068C9.58251 9.83481 10.6938 9 12 9C13.3062 9 14.4174 9.83481 14.8293 11H18.9291ZM12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z`;

// Sliders / settings path (Data icon) — three horizontal bars
const DATA_PATH = `M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z`;

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const COLORS = useColors();
  const canvasSize = ICON_SIZE + PAD * 2;

  let iconPath: string;
  let useFill = focused;
  if (name === 'Home') {
    iconPath = HOME_PATH;
  } else if (name === 'Search') {
    iconPath = SEARCH_PATH;
  } else {
    // Data tab — always stroke (sliders look better as lines)
    iconPath = DATA_PATH;
    useFill = false;
  }

  const color = focused ? COLORS.gold : COLORS.textMuted;

  return (
      <Canvas style={{ width: canvasSize, height: canvasSize }}>
        {useFill && (
          <>
            <Shadow dx={0} dy={0} blur={8} color={`${COLORS.gold}40`} />
            <Path path={iconPath} color={COLORS.gold} style="fill" />
            <Shadow dx={0} dy={0} blur={0} color="transparent" />
            <Path path={iconPath} color={COLORS.gold} style="fill" />
          </>
        )}
        {!useFill && (
          <Path
            path={iconPath}
            color={color}
            style="stroke"
            strokeWidth={1.3}
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      </Canvas>
  );
}

// --------------- Home Stack ---------------

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Collection" component={CollectionScreen} />
      <HomeStack.Screen name="ManageChildren" component={ManageChildrenScreen} />
    </HomeStack.Navigator>
  );
}

// --------------- Search Stack ---------------

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
    </SearchStack.Navigator>
  );
}

// --------------- Tab Navigator ---------------

function MainTabNavigator() {
  const COLORS = useColors();
  const { width: screenWidth } = useWindowDimensions();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarBackground: () => (
            <Canvas style={StyleSheet.absoluteFill}>
              <RoundedRect x={0} y={0} width={screenWidth} height={64} r={0} color={COLORS.surface} /> 
            </Canvas>
        ),
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: 'transparent',
          backgroundColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: 'Collectors' }} />
      <Tab.Screen name="Search" component={SearchStackNavigator} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="Data" component={DataManagementScreen} options={{ tabBarLabel: 'Data' }} />
    </Tab.Navigator>
  );
}

// --------------- Root Navigator ---------------

export function Navigation() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
        <RootStack.Screen
          name="AddChild"
          component={AddChildScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
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
import { COLORS, RADII } from '../theme/skiaTheme';

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
const HOME_PATH = `M${PAD+3} ${PAD+12} L${PAD+12} ${PAD+4} L${PAD+21} ${PAD+12} V${PAD+21} H${PAD+17} V${PAD+14} H${PAD+7} V${PAD+21} H${PAD+3} Z`;

// Magnifying glass path (Search icon)
const SEARCH_PATH = `M${PAD+16} ${PAD+16} L${PAD+22} ${PAD+22} M${PAD+12} ${PAD+19} A${ICON_SIZE/2-4} ${ICON_SIZE/2-4} 0 1 0 ${PAD+4} ${PAD+9} A${ICON_SIZE/2-4} ${ICON_SIZE/2-4} 0 1 0 ${PAD+12} ${PAD+19} Z`;

// Sliders / settings path (Data icon) — three horizontal bars
const DATA_PATH = `M${PAD+4} ${PAD+7} L${PAD+24} ${PAD+7} M${PAD+4} ${PAD+14} L${PAD+20} ${PAD+14} M${PAD+4} ${PAD+21} L${PAD+24} ${PAD+21}`;

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
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
    <View style={{ width: canvasSize, height: canvasSize }}>
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
            strokeWidth={name === 'Data' ? 2.2 : 1.8}
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      </Canvas>
    </View>
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
  const { width: screenWidth } = useWindowDimensions();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <Canvas style={StyleSheet.absoluteFill}>
              {/* Tab bar surface */}
              <RoundedRect x={0} y={0} width={screenWidth} height={64} r={0} color={COLORS.surface} />
              {/* Gradient accent line at top */}
              <RoundedRect x={0} y={0} width={screenWidth} height={2} r={0} color={COLORS.surface}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: screenWidth, y: 0 }}
                  colors={[COLORS.gold, COLORS.electricBlue] as [string, string]}
                />
              </RoundedRect>
            </Canvas>
          </View>
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

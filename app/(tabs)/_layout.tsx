import { TabBar } from '@/components/navigation/TabBar';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import React from 'react';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  return (
    <MaterialTopTabs
      tabBar={(props) => <TabBar {...props} />}
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
      }}>
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <MaterialTopTabs.Screen
        name="likes"
        options={{
          title: 'Likes',
        }}
      />
      <MaterialTopTabs.Screen
        name="fridge"
        options={{
          title: 'Fridge',
        }}
      />

      <MaterialTopTabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
        }}
      />
      <MaterialTopTabs.Screen
        name="feed"
        options={{
          title: 'Feed',
        }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </MaterialTopTabs>
  );
}

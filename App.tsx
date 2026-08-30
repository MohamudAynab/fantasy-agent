import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './src/screens/DashboardScreen';
import DraftAssistantScreen from './src/screens/DraftAssistantScreen';
import WaiverWireScreen from './src/screens/WaiverWireScreen';
import TradeAnalyzerScreen from './src/screens/TradeAnalyzerScreen';
import InjuryReportScreen from './src/screens/InjuryReportScreen';
import ChatScreen from './src/screens/ChatScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import AppHeader from './components/AppHeader';
import { getAuthStatus, registerPushToken } from './src/api/client';
import { Colors } from './src/theme';

const Tab = createBottomTabNavigator();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: TabIconName; inactive: TabIconName }> = {
  Dashboard: { active: 'football',                 inactive: 'football-outline'                 },
  Draft:     { active: 'list',                     inactive: 'list-outline'                     },
  Waivers:   { active: 'swap-horizontal',          inactive: 'swap-horizontal-outline'          },
  Trades:    { active: 'git-compare',              inactive: 'git-compare-outline'              },
  Injuries:  { active: 'medkit',                   inactive: 'medkit-outline'                   },
  Agent:     { active: 'chatbubble-ellipses',      inactive: 'chatbubble-ellipses-outline'      },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons = TAB_ICONS[name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
  return (
    <View style={styles.tabIconWrap}>
      {focused && <View style={styles.tabDot} />}
      <Ionicons
        name={focused ? icons.active : icons.inactive}
        size={22}
        color={focused ? Colors.accent : Colors.muted}
      />
    </View>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { authenticated } = await getAuthStatus();
      setAuthenticated(authenticated);
      if (authenticated) registerForPushNotifications();
    } catch {
      setAuthenticated(false);
    }
  }

  async function registerForPushNotifications() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      const { data: token } = await Notifications.getExpoPushTokenAsync();
      await registerPushToken(token);
    } catch {
      // push notifications are optional — ignore errors silently
    }
  }

  if (authenticated === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  const headerRight = () => <AppHeader />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          {authenticated ? (
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerStyle:             { backgroundColor: Colors.bg },
                headerTintColor:         Colors.text,
                headerRight,
                headerRightContainerStyle: { paddingRight: 16 },
                tabBarStyle:             { backgroundColor: Colors.surface, borderTopColor: Colors.border, height: 58, paddingBottom: 8 },
                tabBarActiveTintColor:   Colors.accent,
                tabBarInactiveTintColor: Colors.muted,
                tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
                tabBarShowLabel: true,
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
              })}
            >
              <Tab.Screen name="Dashboard" component={DashboardScreen} />
              <Tab.Screen name="Draft"     component={DraftAssistantScreen} />
              <Tab.Screen name="Waivers"   component={WaiverWireScreen} />
              <Tab.Screen name="Trades"    component={TradeAnalyzerScreen} />
              <Tab.Screen name="Injuries"  component={InjuryReportScreen} />
              <Tab.Screen name="Agent"     component={ChatScreen} />
            </Tab.Navigator>
          ) : (
            <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.bg }, headerTintColor: Colors.text }}>
              <Tab.Screen
                name="Connect"
                options={{ tabBarStyle: { display: 'none' } }}
              >
                {() => <ConnectScreen onConnected={() => setAuthenticated(true)} />}
              </Tab.Screen>
            </Tab.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  tabIconWrap: { alignItems: 'center', gap: 2 },
  tabDot:      { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.accent },
});

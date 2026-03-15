import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BusScreen from "./src/screens/BusScreen";
import CalculatorScreen from "./src/screens/CalculatorScreen";
import XiaoXiaoScreen from "./src/screens/XiaoXiaoScreen";

export type RootStackParamList = {
  Bus: undefined;
  Calculator: undefined;
  XiaoXiao: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Bus"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1A1B26" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Bus" component={BusScreen} />
        <Stack.Screen name="Calculator" component={CalculatorScreen} />
        <Stack.Screen name="XiaoXiao" component={XiaoXiaoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import {
  BottomTabBarHeightCallbackContext,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {BottomTabDescriptorMap} from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import {MissingIcon} from '@react-navigation/elements';
import {
  CommonActions,
  NavigationContext,
  NavigationRouteContext,
  ParamListBase,
  TabNavigationState,
  useIsFocused,
  useLinkBuilder,
  useTheme,
} from '@react-navigation/native';
import React, {createRef, useContext, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Button,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  EdgeInsets,
  Rect,
  useSafeAreaFrame,
} from 'react-native-safe-area-context';

import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaView,
} from 'react-native-safe-area-context';

// import type { BottomTabBarProps, BottomTabDescriptorMap } from '../types';
// import BottomTabBarHeightCallbackContext from '../utils/BottomTabBarHeightCallbackContext';
import useIsKeyboardShown from '@react-navigation/bottom-tabs/src/utils/useIsKeyboardShown';
import BottomTabItem from '@react-navigation/bottom-tabs/src/views/BottomTabItem';
import {useMyContext} from '../../../../context/Context';
import {create} from 'react-test-renderer';
import OverlayVideoScreen from './OverlayVideoScreen';

type Props = BottomTabBarProps & {
  style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
};

let heightAnimation: any = createRef().current;
heightAnimation = new Animated.Value(0);

const DEFAULT_TABBAR_HEIGHT = 49;
const COMPACT_TABBAR_HEIGHT = 32;
const DEFAULT_MAX_TAB_ITEM_WIDTH = 125;

const useNativeDriver = Platform.OS !== 'web';

type Options = {
  state: TabNavigationState<ParamListBase>;
  descriptors: BottomTabDescriptorMap;
  layout: {height: number; width: number};
  dimensions: {height: number; width: number};
};

const shouldUseHorizontalLabels = ({
  state,
  descriptors,
  layout,
  dimensions,
}: Options) => {
  const {tabBarLabelPosition} =
    descriptors[state.routes[state.index].key].options;

  if (tabBarLabelPosition) {
    switch (tabBarLabelPosition) {
      case 'beside-icon':
        return true;
      case 'below-icon':
        return false;
    }
  }

  if (layout.width >= 768) {
    // Screen size matches a tablet
    const maxTabWidth = state.routes.reduce((acc, route) => {
      const {tabBarItemStyle} = descriptors[route.key].options;
      const flattenedStyle = StyleSheet.flatten(tabBarItemStyle);

      if (flattenedStyle) {
        if (typeof flattenedStyle.width === 'number') {
          return acc + flattenedStyle.width;
        } else if (typeof flattenedStyle.maxWidth === 'number') {
          return acc + flattenedStyle.maxWidth;
        }
      }

      return acc + DEFAULT_MAX_TAB_ITEM_WIDTH;
    }, 0);

    return maxTabWidth <= layout.width;
  } else {
    return dimensions.width > dimensions.height;
  }
};

const getPaddingBottom = (insets: EdgeInsets) =>
  Math.max(insets.bottom - Platform.select({ios: 4, default: 0}), 0);

export const getTabBarHeight = ({
  state,
  descriptors,
  dimensions,
  insets,
  style,
  ...rest
}: Options & {
  insets: EdgeInsets;
  style: Animated.WithAnimatedValue<StyleProp<ViewStyle>> | undefined;
}) => {
  // @ts-ignore
  const customHeight = StyleSheet.flatten(style)?.height;

  if (typeof customHeight === 'number') {
    return customHeight;
  }

  const isLandscape = dimensions.width > dimensions.height;
  const horizontalLabels = shouldUseHorizontalLabels({
    state,
    descriptors,
    dimensions,
    ...rest,
  });
  const paddingBottom = getPaddingBottom(insets);

  if (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    isLandscape &&
    horizontalLabels
  ) {
    return COMPACT_TABBAR_HEIGHT + paddingBottom;
  }

  return DEFAULT_TABBAR_HEIGHT + paddingBottom;
};

export default function BottomTabBar({
  state,
  navigation,
  descriptors,
  insets,
  style,
}: Props) {
  const {colors} = useTheme();
  const buildLink = useLinkBuilder();

  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  const {
    tabBarShowLabel,
    tabBarHideOnKeyboard = false,
    tabBarVisibilityAnimationConfig,
    tabBarStyle,
    tabBarBackground,
    tabBarActiveTintColor,
    tabBarInactiveTintColor,
    tabBarActiveBackgroundColor,
    tabBarInactiveBackgroundColor,
  } = focusedOptions;

  const dimensions = useSafeAreaFrame();
  const isKeyboardShown = useIsKeyboardShown();

  const onHeightChange = React.useContext(BottomTabBarHeightCallbackContext);

  const shouldShowTabBar = !(tabBarHideOnKeyboard && isKeyboardShown);

  const visibilityAnimationConfigRef = React.useRef(
    tabBarVisibilityAnimationConfig,
  );

  React.useEffect(() => {
    visibilityAnimationConfigRef.current = tabBarVisibilityAnimationConfig;
  });

  const [isTabBarHidden, setIsTabBarHidden] = React.useState(!shouldShowTabBar);

  const [visible] = React.useState(
    () => new Animated.Value(shouldShowTabBar ? 1 : 0),
  );

  React.useEffect(() => {
    const visibilityAnimationConfig = visibilityAnimationConfigRef.current;

    if (shouldShowTabBar) {
      const animation =
        visibilityAnimationConfig?.show?.animation === 'spring'
          ? Animated.spring
          : Animated.timing;

      animation(visible, {
        toValue: 1,
        useNativeDriver,
        duration: 250,
        ...visibilityAnimationConfig?.show?.config,
      }).start(({finished}) => {
        if (finished) {
          setIsTabBarHidden(false);
        }
      });
    } else {
      setIsTabBarHidden(true);

      const animation =
        visibilityAnimationConfig?.hide?.animation === 'spring'
          ? Animated.spring
          : Animated.timing;

      animation(visible, {
        toValue: 0,
        useNativeDriver,
        duration: 200,
        ...visibilityAnimationConfig?.hide?.config,
      }).start();
    }

    return () => visible.stopAnimation();
  }, [visible, shouldShowTabBar]);

  const [layout, setLayout] = React.useState({
    height: 0,
    width: dimensions.width,
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const {height, width} = e.nativeEvent.layout;

    onHeightChange?.(height);

    setLayout(layout => {
      if (height === layout.height && width === layout.width) {
        return layout;
      } else {
        return {
          height,
          width,
        };
      }
    });
  };

  const {routes} = state;

  const paddingBottom = getPaddingBottom(insets);
  const tabBarHeight = getTabBarHeight({
    state,
    descriptors,
    insets,
    dimensions,
    layout,
    style: [tabBarStyle, style],
  });

  const hasHorizontalLabels = shouldUseHorizontalLabels({
    state,
    descriptors,
    dimensions,
    layout,
  });

  const tabBarBackgroundElement = tabBarBackground?.();

  // Added Code Start

  let videoScreenRef = useRef<any>({});

  const sa: any = SafeAreaInsetsContext;

  const a: any = SafeAreaFrameContext;
  const sc = a?._currentValue;

  const {
    theme,
    setTheme,
    videoScreenStatus,
    setVideoScreenStatus,
    isPlaying,
    setIsPlaying,
  } = useMyContext();

  const [orientation, setOrientation] = useState('LANDSCAPE');

  const determineAndSetOrientation = () => {
    let width = Dimensions.get('window').width;
    let height = Dimensions.get('window').height;

    if (width < height) {
      setOrientation('PORTRAIT');
    } else {
      setOrientation('LANDSCAPE');
    }
  };

  useEffect(() => {
    determineAndSetOrientation();
    Dimensions.addEventListener('change', determineAndSetOrientation);

    return () => {};
  }, []);

  const hideTabBar = (isHide: boolean) => {
    if (isHide) {
      hideStatusBar(true);
    }
    Animated.timing(visible, {
      toValue: isHide ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        if (!isHide) {
          hideStatusBar(false);
        }
      }
    });
  };

  const hideStatusBar = (isHide: boolean) => {
    StatusBar.setHidden(isHide);
  };

  useEffect(() => {
    let videoScreenHeight = 0;
    if (videoScreenStatus === 'opened') {
      if (orientation === 'LANDSCAPE') {
        hideTabBar(true);
        videoScreenHeight = sc.height;
      } else {
        hideTabBar(false);
        videoScreenHeight = sc.height - tabBarHeight;
      }

      Animated.timing(heightAnimation, {
        toValue: videoScreenHeight,
        duration: 200,
        useNativeDriver: false,
      }).start(({finished}) => {
        if (finished) {
        }
      });
    } else {
      if (videoScreenStatus === 'minimized') {
        Animated.timing(heightAnimation, {
          toValue: 50,
          duration: 200,
          useNativeDriver: false,
        }).start(({finished}) => {
          if (finished) {
          }
        });
        hideTabBar(false);
      } else {
        Animated.timing(heightAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start(({finished}) => {
          if (finished) {
          }
        });
        hideTabBar(false);
      }
    }
  }, [videoScreenStatus, orientation, sc.height, heightAnimation]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (videoScreenStatus === 'opened') {
      const backAction = () => {
        setVideoScreenStatus('minimized');
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }
  }, [isFocused, videoScreenStatus]);

  return (
    <>
      <Animated.View
        ref={videoScreenRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: heightAnimation.interpolate({
            inputRange: [55, sc.height],
            outputRange:
              orientation !== 'LANDSCAPE'
                ? [tabBarHeight, tabBarHeight]
                : [tabBarHeight, 0],
          }),
          height: heightAnimation,
          backgroundColor: 'green',
          borderColor: 'yellow',
          overflow: 'hidden',
          borderWidth: heightAnimation.interpolate({
            inputRange: [55, sc.height],
            outputRange: [0, 1],
          }),
          zIndex: 7,
        }}>
        <OverlayVideoScreen />
      </Animated.View>
      <Animated.View
        style={[
          styles.tabBar,
          {
            backgroundColor:
              tabBarBackgroundElement != null ? 'transparent' : colors.card,
            borderTopColor: colors.border,
          },
          {
            transform: [
              {
                translateY: visible.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    layout.height + paddingBottom + StyleSheet.hairlineWidth,
                    0,
                  ],
                }),
              },
            ],
            // Absolutely position the tab bar so that the content is below it
            // This is needed to avoid gap at bottom when the tab bar is hidden
            position: isTabBarHidden ? 'absolute' : (null as any),
          },
          {
            height: tabBarHeight,
            paddingBottom,
            paddingHorizontal: Math.max(insets.left, insets.right),
          },
          tabBarStyle,
        ]}
        pointerEvents={isTabBarHidden ? 'none' : 'auto'}
        onLayout={handleLayout}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {tabBarBackgroundElement}
        </View>
        <View accessibilityRole="tablist" style={styles.content}>
          {routes.map((route, index) => {
            const focused = index === state.index;
            const {options} = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.dispatch({
                  ...CommonActions.navigate({name: route.name, merge: true}),
                  target: state.key,
                });
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const accessibilityLabel =
              options.tabBarAccessibilityLabel !== undefined
                ? options.tabBarAccessibilityLabel
                : typeof label === 'string' && Platform.OS === 'ios'
                ? `${label}, tab, ${index + 1} of ${routes.length}`
                : undefined;

            return (
              <NavigationContext.Provider
                key={route.key}
                value={descriptors[route.key].navigation}>
                <NavigationRouteContext.Provider value={route}>
                  <BottomTabItem
                    route={route}
                    descriptor={descriptors[route.key]}
                    focused={focused}
                    horizontal={hasHorizontalLabels}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    accessibilityLabel={accessibilityLabel}
                    to={buildLink(route.name, route.params)}
                    testID={options.tabBarTestID}
                    allowFontScaling={options.tabBarAllowFontScaling}
                    activeTintColor={tabBarActiveTintColor}
                    inactiveTintColor={tabBarInactiveTintColor}
                    activeBackgroundColor={tabBarActiveBackgroundColor}
                    inactiveBackgroundColor={tabBarInactiveBackgroundColor}
                    button={options.tabBarButton}
                    icon={
                      options.tabBarIcon ??
                      (({color, size}) => (
                        <MissingIcon color={color} size={size} />
                      ))
                    }
                    badge={options.tabBarBadge}
                    badgeStyle={options.tabBarBadgeStyle}
                    label={label}
                    showLabel={tabBarShowLabel}
                    labelStyle={options.tabBarLabelStyle}
                    iconStyle={options.tabBarIconStyle}
                    style={options.tabBarItemStyle}
                  />
                </NavigationRouteContext.Provider>
              </NavigationContext.Provider>
            );
          })}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
});

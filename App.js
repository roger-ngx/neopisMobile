import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';

import store from './store/store'
import Dashboard from './screens/Dashboard';

import { IntlProvider } from 'react-intl';
import { addLocaleData } from "react-intl";
import locale_en from 'react-intl/locale-data/en';
import locale_ko from 'react-intl/locale-data/ko';
import messages_ko from "./assets/i18n/ko.json";
import messages_en from "./assets/i18n/en.json";

addLocaleData([...locale_en, ...locale_ko]);

const messages = {
  'ko': messages_ko,
  'en': messages_en
};
const language = 'en';  // language without region code

export default class App extends React.Component {
  render() {
    return (
      <IntlProvider locale={language} messages={messages[language]}>
        <Provider store={store}>
          <View style={styles.container}>
            <Dashboard />
          </View>
        </Provider>
      </IntlProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

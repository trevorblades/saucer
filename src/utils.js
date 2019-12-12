import decode from 'jwt-decode';
import {createContext} from 'react';
import {gql} from '@apollo/client';

export function userFromToken(token) {
  try {
    const user = decode(token);
    return {
      ...user,
      __typename: 'User'
    };
  } catch (error) {
    return null;
  }
}

export const UserContext = createContext();

export const INSTANCE_FRAGMENT = gql`
  fragment InstanceFragment on Instance {
    id
    name
    status
    isReady
    createdAt
  }
`;

export const LIST_INSTANCES = gql`
  {
    instances {
      ...InstanceFragment
    }
    cards {
      id
      last4
      brand
      isDefault
    }
  }
  ${INSTANCE_FRAGMENT}
`;

export const CARD_FRAGMENT = gql`
  fragment CardFragment on Card {
    id
    brand
    last4
    expMonth
    expYear
    isDefault
  }
`;

export const LIST_CARDS = gql`
  {
    cards {
      ...CardFragment
    }
  }
  ${CARD_FRAGMENT}
`;

export const locales = {
  English: 'en_US',
  'English (UK)': 'en_GB',
  Русский: 'ru_RU',
  Deutsch: 'de_DE',
  日本語: 'ja',
  Español: 'es_ES',
  Français: 'fr_FR',
  Português: 'pt_PT',
  'Português do Brasil': 'pt_BR',
  简体中文: 'zh_CN',
  Italiano: 'it_IT',
  Polski: 'pl_PL',
  한국어: 'ko_KR',
  हिन्दी: 'hi_IN',
  Svenska: 'sv_SE',
  'Tiếng Việt': 'vi',
  Nederlands: 'nl_NL'
};

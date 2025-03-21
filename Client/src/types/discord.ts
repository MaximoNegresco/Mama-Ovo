// Types for Discord.js client integration

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bot?: boolean;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner_id: string;
  features: string[];
}

export interface DiscordChannel {
  id: string;
  type: number;
  guild_id?: string;
  name: string;
  topic?: string;
  position?: number;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}

export interface DiscordCommand {
  id: string;
  application_id: string;
  name: string;
  description: string;
  options?: any[];
}

export enum DiscordCommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3
}

export enum DiscordCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
  ATTACHMENT = 11
}

export interface DiscordCommandOption {
  type: DiscordCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: { name: string; value: string | number }[];
  options?: DiscordCommandOption[];
}

export interface DiscordInteraction {
  id: string;
  application_id: string;
  type: number;
  data?: {
    id: string;
    name: string;
    options?: {
      name: string;
      value: string | number | boolean;
    }[];
  };
  guild_id?: string;
  channel_id?: string;
  member?: {
    user: DiscordUser;
    roles: string[];
    permissions: string;
  };
  user?: DiscordUser;
  token: string;
  version: number;
}

export enum DiscordInteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5
}

export interface DiscordInteractionResponse {
  type: number;
  data?: {
    content?: string;
    embeds?: any[];
    allowed_mentions?: {
      parse?: string[];
      roles?: string[];
      users?: string[];
      replied_user?: boolean;
    };
    flags?: number;
    components?: any[];
  };
}

export enum DiscordInteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  MODAL = 9
}

export interface DiscordEmbed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: {
    text: string;
    icon_url?: string;
  };
  image?: {
    url: string;
    height?: number;
    width?: number;
  };
  thumbnail?: {
    url: string;
    height?: number;
    width?: number;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
}

export interface DiscordMessageComponent {
  type: number;
  custom_id?: string;
  disabled?: boolean;
  style?: number;
  label?: string;
  emoji?: {
    id?: string;
    name?: string;
    animated?: boolean;
  };
  url?: string;
  options?: {
    label: string;
    value: string;
    description?: string;
    emoji?: {
      id?: string;
      name?: string;
      animated?: boolean;
    };
    default?: boolean;
  }[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  components?: DiscordMessageComponent[];
}

export enum DiscordComponentType {
  ACTION_ROW = 1,
  BUTTON = 2,
  SELECT_MENU = 3,
  TEXT_INPUT = 4
}

export enum DiscordButtonStyle {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DANGER = 4,
  LINK = 5
}

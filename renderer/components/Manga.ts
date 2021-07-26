export interface Volumen {
  results: ChapterResponse[];
  limit: number;
  offset: number;
  total: number;
}

interface ChapterResponse {
  result: string;
  data: {
    id: string;
    type: string;
    attributes: {
      title: string;
      volume: string | null;
      chapter: string | null;
      translatedLanguage: string;
      hash: string;
      data: string[];
      dataSaver: string[];
      uploader: string;
      version: number;
      createdAt: string;
      updatedAt: string;
      publishAt: string;
    };
  };
  relationships: Relationship[];
}

interface Relationship {
  id: string;
  type: string;
}

export interface Volumenes {
  result: string;
  volumes: Volumes[];
}

interface Volumes {
  volume: string;
  count: number;
  chapters: Chapters[];
}

interface Chapters {
  chapter: string;
  count: number;
}

export interface MangadexHome {
  baseUrl: string;
}

export interface Manga {
  data: {
    id: string;
    attributes: {
      title: string[];
    };
  };
  relationships: Relationship[];
}

export interface Cover {
  result: string;
  data: {
    id: string;
    type: string;
    attributes: {
      volume: string | null;
      fileName: string;
      description: string | null;
      version: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  relationships: Relationship[];
}

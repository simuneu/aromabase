// perfume.controller.ts
import e, { Request, Response, NextFunction } from 'express';
import * as perfumeService from '../services/perfume.service';
import { parseNoteType } from '../utils/changeNoteType';
import { PerfumeSearchParams } from '../types/PerfumeSearchParams';

// 향수 생성
export const createPerfume = async (req: Request, res: Response, next: NextFunction) => {

  try {
    // 이미지 파일이 있는 경우만 처리
   
    const files = req.files as Express.Multer.File[];
     let images = undefined;
    if (files && files.length > 0) {
      images = files.map((file) => ({
        url_path: `${file.filename}`,
      }));
       console.log('파일 이미지 업로드:', images);
    }

    // notes가 JSON 문자열로 전달되므로 파싱
    const parsedNotes = JSON.parse(req.body.notes || '[]');

    //const perfume = await perfumeService.createPerfume(req.body, req.user!.user_id);
    const perfume = await perfumeService.createPerfume({
      ...req.body,
      price: Number(req.body.price),
      point: Number(req.body.point),
      ...(images && { images }), // 이미지가 있을 때만 포함
      notes: parsedNotes,
    }, req.user!.user_id);

    res.status(201).json(perfume);
  } catch (err) {
    console.log('createPerfume err 시작');
    next(err);
  }
};

// 향수 수정
export const updatePerfume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const perfumeId = Number(req.params.perfume_id);

    // 이미지 파일이 있는 경우만 처리
    let images = undefined;
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      images = files.map((file) => ({
        url_path: `${file.filename}`,
      }));
       console.log('파일 수정용 이미지 업로드:', images);
    }


   
    console.log('req.body.notes:', req.body.notes);
   
    // notes가 JSON 문자열로 전달되므로 파싱
    const parsedNotes = JSON.parse(req.body.notes || '[]');

    const perfume = await perfumeService.updatePerfume(perfumeId, {
      ...req.body,
      price: Number(req.body.price),
      point: Number(req.body.point),
      ...(images && { images }), // 이미지가 있을 때만 포함
      notes: parsedNotes,
    }, req.user!.user_id);

    res.json(perfume);
  } catch (err) {
    next(err);
  }
};




// 향수 상세 조회
export const getPerfumeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const perfumeId = Number(req.params.perfume_id);
    console.log(perfumeId)
    const perfume = await perfumeService.getPerfumeById(perfumeId);
    res.json(perfume);
  } catch (err) {
    next(err);
  }
};



// 향수 삭제
export const deletePerfume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const perfumeId = Number(req.params.perfume_id);
    await perfumeService.deletePerfume(perfumeId, req.user!.user_id);
    res.json({ message: '향수가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
}

export const getMyPerfumeController = async (req: Request, res: Response): Promise<void> => {
  try {
    //헤더에서 id값 가져오기(auth-토큰)
    const userId = req.user?.user_id;
    console.log(userId)

    if (!userId) {
      res.status(401).json({ errorMessage: "no user ID" });
      return;
    }

    const myPerfumes = await perfumeService.getMyPerfumesService(userId);
    console.log(myPerfumes)
    res.status(200).json({ data: myPerfumes });
  } catch (error: any) {
    res.status(500).json({ errorMessage: error.message });
  }
}


// export const getSearchPerfume = async (req: Request, res: Response) => {
//   try {
//     const data = req.body;

//     // 🔹 입력값 검증 및 매핑
//     const brandName = data.brand ?? null;
//     const perfumeName = data.perfumeName ?? null;
//     const noteType = parseNoteType(data.noteType); // enum 검증 함수
//     const noteName = data.noteName ?? null;
//     const nickname = data.nickname ?? null;

//     // 🔹 OR 조건 배열 생성 (컨트롤러에서 안전하게 검증)
//     const orConditions: any[] = [];

//     if (brandName) {
//       orConditions.push({ brandName: { contains: brandName } });
//     }

//     if (perfumeName) {
//       orConditions.push({ perfumeName: { contains: perfumeName } });
//     }

//     if (noteType || noteName) {
//       orConditions.push({
//         notes: {
//           some: {
//             ...(noteType ? { noteType } : {}),
//             ...(noteName ? { noteName: { contains: noteName } } : {}),
//           },
//         },
//       });
//     }

//     if (nickname) {
//       orConditions.push({ user: { nickname: { contains: nickname } } });
//     }

//     // 🔹 검색 조건이 하나도 없으면 빈 배열 반환 (전체 공개 향수 노출 방지)
//     if (orConditions.length === 0) {
//       return res.json({ data: [] });
//     }

//     console.log(orConditions);

//     // 🔹 서비스 호출 (OR 조건 배열만 전달)
//     const searchedPerfumes = await perfumeService.getSearchPerfumeService(orConditions);

//     res.json({ data: searchedPerfumes });
//   } catch (error: any) {
//     console.error("getSearchPerfume Error:", error);
//     res.status(400).json({ errorMessage: "getSearchPerfume 컨트롤러 오류" });
//   }
// };

export const getSearchPerfume = async (req: Request, res: Response) => {
  try {
    const { brand, perfumeName, NoteType, noteName, nickname } = req.body;

    // 🔎 OR 조건 배열 생성 (컨트롤러에서 검증 포함)
    const orConditions: any[] = [];

    if (brand) {
      orConditions.push({ brandName: { contains: brand } });
    }
    if (perfumeName) {
      orConditions.push({ perfumeName: { contains: perfumeName } });
    }
    if (NoteType || noteName) {
      const parsedNoteType = parseNoteType(NoteType); // enum 처리
      orConditions.push({
        notes: {
          some: {
            noteType: parsedNoteType ?? undefined,
            noteName: noteName ? { contains: noteName } : undefined,
          },
        },
      });
    }
    if (nickname) {
      orConditions.push({ user: { nickname: { contains: nickname } } });
    }

    // ❗ 검색 조건 없으면 전체 공개 방지
    if (orConditions.length === 0) {
      return res.json({ data: [] });
    }

    const searchedPerfumes = await perfumeService.getSearchPerfumeService(orConditions);
    res.json({ data: searchedPerfumes });
  } catch (error: any) {
    console.error('getSearchPerfume Error:', error);
    res.status(500).json({ errorMessage: 'getSearchPerfume 컨트롤러 오류' });
  }
};


export const getPublicPerfumes = async (req: Request, res: Response) => {
  try {
    const publicPerfumes = await perfumeService.getpublicPerfumesService();
    res.json({ data: publicPerfumes });
  } catch (error: any) {
    console.error('getPublicPerfumes Error:', error);
    res.status(500).json({ errorMessage: '전체 공개 향수를 불러오는 중 서버 오류가 발생했습니다.' });
  }
};


export const getNoteList = async (req: Request, res: Response) => {
  const noteType = req.params.note_type;
  if (!noteType) {
    return res.status(400).json({ errorMessage: '노트 타입이 필요합니다.' });
  } 
  try {
    const noteList = await perfumeService.getNoteListService(noteType);
    res.json({ data: noteList });
  } catch (error: any) {
    res.status(500).json({ errorMessage: error.message });
  }
}
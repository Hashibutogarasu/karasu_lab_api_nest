import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { createClient } from 'newt-client-js';
import { Blog } from '@karasu-lab/karasu-lab-api-types';

@Controller()
export class AppController {
  @Get('/public')
  async public() {
    return { message: 'public api' };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/private')
  async private(@Request() req) {
    return { message: 'private api', sub: req.user.sub };
  }

  @Get('/blog')
  async blog() {
    const client = createClient({
      spaceUid: process.env.NEWT_SPACE_UID,
      token: process.env.NEWT_SPACE_TOKEN,
      apiType: 'cdn',
    });

    const items = await client.getContents<Blog>({
      appUid: process.env.NEWT_APP_UID,
      modelUid: process.env.NEWT_MODEL_UID,
    });

    return items.items;
  }

  @Get('/blog/:id')
  async blogDetail(@Request() req) {
    const id = req.params.id;
    const client = createClient({
      spaceUid: process.env.NEWT_SPACE_UID,
      token: process.env.NEWT_SPACE_TOKEN,
      apiType: 'cdn',
    });

    const item = await client.getFirstContent<Blog>({
      appUid: process.env.NEWT_APP_UID,
      modelUid: process.env.NEWT_MODEL_UID,
      query: {
        id,
        select: ['_id', 'title', 'content'],
        content: {
          fmt: 'text',
        },
      },
    });

    return item;
  }
}

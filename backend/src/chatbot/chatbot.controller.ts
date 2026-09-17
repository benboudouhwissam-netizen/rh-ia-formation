import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatbotMessageDto } from './dto/chatbot-message.dto';
import { ChatbotService } from './chatbot.service';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @ApiOperation({ summary: 'Répondre à une question de l’assistant RH' })
  message(@Body() dto: ChatbotMessageDto) {
    return this.chatbotService.answer(dto.utilisateur_id, dto.message);
  }
}

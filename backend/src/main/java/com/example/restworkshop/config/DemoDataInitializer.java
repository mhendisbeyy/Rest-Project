package com.example.restworkshop.config;

import com.example.restworkshop.models.Task;
import com.example.restworkshop.enums.TaskStatus;
import com.example.restworkshop.repositories.TaskRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true", matchIfMissing = true)
public class DemoDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);
    private final TaskRepository taskRepository;

    public DemoDataInitializer(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (taskRepository.count() != 0) {
            log.info("Mevcut görevler korundu; örnek veri eklenmedi.");
            return;
        }

        taskRepository.saveAll(List.of(
                new Task("REST sunumunu hazırla", "HTTP isteğinin parçalarını örnekle.", TaskStatus.OPEN),
                new Task("Controller katmanını incele", "URL ve HTTP metodunu Java metoduna bağla.", TaskStatus.IN_PROGRESS),
                new Task("Service iş kuralını tasarla", "Tamamlanmış görev yeniden açılamasın.", TaskStatus.OPEN),
                new Task("Repository sorgusunu izle", "JPA sorgusunu SQL logunda bul.", TaskStatus.DONE),
                new Task("Security demosunu planla", "401 ile 403 farkını göster.", TaskStatus.IN_PROGRESS),
                new Task("Sunum provası yap", null, TaskStatus.DONE)
        ));
        log.info("Boş görev tablosuna 6 örnek görev eklendi.");
    }
}

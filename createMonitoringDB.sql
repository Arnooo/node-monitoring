CREATE DATABASE MonitoringDB;
USE MonitoringDB;
CREATE TABLE Probes
(
    probe_uid INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    probe_name VARCHAR(255) NOT NULL,
    description TEXT
);
CREATE TABLE ProbeAcquMode
(
    probe_acqu_mode_uid INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    acquisition_mode_name VARCHAR(255) NOT NULL,
    acquisition_mode ENUM('ASAP', 'ONTIME') DEFAULT 'ASAP',
    frequency_hz FLOAT DEFAULT 1.0,
    measures_per_value INT UNSIGNED DEFAULT 1,
    function_to_compute_value ENUM('avg', 'mean', 'min', 'max', 'median') DEFAULT 'mean',
    real_time_update BOOLEAN DEFAULT TRUE,
    max_history_size_in_second INT UNSIGNED DEFAULT 604800,
    visible_history_size_in_second INT UNSIGNED DEFAULT 604800
);
CREATE TABLE ProbeConfig
(
    probe_config_uid INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    probe_acqu_mode_uid INT,
    node_module VARCHAR(255) NOT NULL,
    probe_type VARCHAR(255) DEFAULT 'NOTYPE',
    unit VARCHAR(255) NOT NULL,
    FOREIGN KEY (probe_acqu_mode_uid) REFERENCES ProbeAcquMode(probe_acqu_mode_uid)
    
);
CREATE TABLE ProbesManagement
(
    probe_history_table_uid VARCHAR(255) PRIMARY KEY NOT NULL,
    probe_uid INT,
    probe_config_uid INT,
    probe_is_connected BOOLEAN DEFAULT false,
    probe_is_running BOOLEAN DEFAULT false,
    FOREIGN KEY (probe_uid) REFERENCES Probes(probe_uid) ON DELETE CASCADE,
    FOREIGN KEY (probe_config_uid) REFERENCES ProbeConfig(probe_config_uid) ON DELETE CASCADE
);
CREATE TABLE Dashboards
(
    dashboard_uid INT PRIMARY KEY NOT NULL,
    dashboard_title VARCHAR(255) NOT NULL,
    description TEXT
);
CREATE TABLE Graphs
(
    graph_uid INT PRIMARY KEY NOT NULL,
    graph_title VARCHAR(255) NOT NULL,
    description TEXT,
    probe_history_table_uid VARCHAR(255)  NOT NULL,
    FOREIGN KEY (probe_history_table_uid) REFERENCES ProbesManagement(probe_history_table_uid)
);
CREATE TABLE DashboardsContent
(
    probe_history_table_uid VARCHAR(255) PRIMARY KEY NOT NULL,
    dashboard_uid INT NOT NULL,
    graph_uid INT NOT NULL,
    FOREIGN KEY (dashboard_uid) REFERENCES Dashboards(dashboard_uid),
    FOREIGN KEY (graph_uid) REFERENCES Graphs(graph_uid)
);

INSERT INTO Probes (probe_name, description) VALUES ('Simulation probe','This probe use a fack sensor to get random temperature data.');
INSERT INTO ProbeAcquMode (acquisition_mode_name, acquisition_mode) VALUES ('Default mode','ASAP');
INSERT INTO ProbeConfig (probe_acqu_mode_uid, probe_type, node_module, unit) VALUES (1, 'Temperature','fack-sensor','°C');
CREATE TABLE Temperature11 (timestamp BIGINT PRIMARY KEY NOT NULL, value FLOAT NOT NULL);
INSERT INTO ProbesManagement (probe_uid, probe_config_uid, probe_history_table_uid, probe_is_running) VALUES (1,1, 'Temperature11', true);






